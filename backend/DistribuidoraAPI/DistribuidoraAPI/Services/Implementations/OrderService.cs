using System.Data;
using DistribuidoraAPI.DTOs.Order;
using DistribuidoraAPI.Enums;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class OrderService : IOrderService
{
    private const decimal MaxAmount = 9_999_999_999.99m;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IUnitOfWork unitOfWork, ILogger<OrderService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<OrderResponseDto>> GetAll(OrderFilterRequest? filters = null)
    {
        var normalizedFilters = NormalizeFilters(filters);
        var orders = await _unitOfWork.Orders.Search(
            normalizedFilters.DateFrom,
            normalizedFilters.DateToInclusive,
            normalizedFilters.CustomerId,
            normalizedFilters.SellerId,
            normalizedFilters.Number);

        return orders.Select(Map).ToList();
    }

    public async Task<OrderResponseDto> GetById(int id)
    {
        var order = await _unitOfWork.Orders.GetByIdWithDetails(id);

        if (order is null)
            throw new KeyNotFoundException($"No se encontró la venta con ID {id}");

        return Map(order);
    }

    public async Task<OrderResponseDto> Create(CreateOrderRequest request)
    {
        var data = NormalizeAndValidate(request);

        await _unitOfWork.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var customer = await _unitOfWork.Customers.GetActiveCustomerById(data.CustomerId);
            if (customer is null)
                throw new KeyNotFoundException($"No se encontró un cliente activo con ID {data.CustomerId}");

            var seller = await _unitOfWork.Users.GetActiveUserById(data.SellerId);
            if (seller is null || seller.Role != Role.Seller)
                throw new KeyNotFoundException($"No se encontró un vendedor activo con ID {data.SellerId}");

            var paymentMethod = await _unitOfWork.PaymentMethods.GetActivePaymentMethodById(data.PaymentMethodId);
            if (paymentMethod is null)
                throw new KeyNotFoundException($"No se encontró un medio de pago activo con ID {data.PaymentMethodId}");

            var creator = await _unitOfWork.Users.GetActiveUserById(request.UserId);
            if (creator is null)
                throw new KeyNotFoundException($"No se encontró un usuario activo con ID {request.UserId}");

            var number = await _unitOfWork.Orders.GetNextNumber();
            var details = new List<OrderDetail>();
            var productsById = new Dictionary<int, Product>();
            decimal total = 0;

            foreach (var item in data.Details)
            {
                var product = await _unitOfWork.Products.GetActiveProductById(item.ProductId);
                if (product is null)
                    throw new KeyNotFoundException($"No se encontró un producto activo con ID {item.ProductId}");

                if (product.Stock < item.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Stock insuficiente para '{product.Description}'. Disponible: {product.Stock}; solicitado: {item.Quantity}");
                }

                ValidateAmount(product.SalePrice, $"El precio de venta de '{product.Description}'");
                ValidateAmount(product.PurchasePrice, $"El precio de compra de '{product.Description}'");

                var subtotal = product.SalePrice * item.Quantity;
                ValidateAmount(subtotal, $"El subtotal de '{product.Description}'");

                total += subtotal;
                ValidateAmount(total, "El total de la venta");

                productsById.Add(product.Id, product);
                details.Add(new OrderDetail
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = item.Quantity,
                    SalePrice = product.SalePrice,
                    PurchasePrice = product.PurchasePrice,
                    Subtotal = subtotal
                });
            }

            var order = new Order
            {
                Number = number,
                CustomerId = customer.Id,
                Customer = customer,
                UserId = seller.Id,
                User = seller,
                PaymentMethodId = paymentMethod.Id,
                PaymentMethod = paymentMethod,
                Date = data.Date,
                Total = total,
                Cancelled = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = creator.Id,
                Details = details
            };

            _unitOfWork.Orders.Add(order);
            await _unitOfWork.SaveChanges();

            foreach (var detail in order.Details)
            {
                var product = productsById[detail.ProductId];
                product.Stock -= detail.Quantity;

                _unitOfWork.GetRepository<StockMovement>().Add(new StockMovement
                {
                    ProductId = product.Id,
                    Product = product,
                    Type = StockMovementType.Sale,
                    Quantity = detail.Quantity,
                    ReferenceId = order.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = creator.Id
                });
            }

            await _unitOfWork.Commit();
            _logger.LogInformation("Se registró la venta {OrderId} con comprobante {Number}", order.Id, order.Number);

            return Map(order);
        }
        catch
        {
            await _unitOfWork.Rollback();
            throw;
        }
    }

    public async Task Cancel(int id, int userId)
    {
        await _unitOfWork.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var order = await _unitOfWork.Orders.GetByIdWithDetails(id);

            if (order is null)
                throw new KeyNotFoundException($"No se encontró la venta con ID {id}");

            if (order.Cancelled)
                throw new InvalidOperationException($"La venta con ID {id} ya está anulada");

            var admin = await _unitOfWork.Users.GetActiveUserById(userId);
            if (admin is null || admin.Role != Role.Admin)
                throw new UnauthorizedAccessException("Solo un administrador activo puede anular ventas");

            foreach (var detail in order.Details)
            {
                if (detail.Product.Stock > int.MaxValue - detail.Quantity)
                {
                    throw new InvalidOperationException(
                        $"No se puede anular la venta: el stock de '{detail.Product.Description}' excedería el máximo permitido");
                }
            }

            foreach (var detail in order.Details)
            {
                detail.Product.Stock += detail.Quantity;

                _unitOfWork.GetRepository<StockMovement>().Add(new StockMovement
                {
                    ProductId = detail.ProductId,
                    Product = detail.Product,
                    Type = StockMovementType.SaleCancellation,
                    Quantity = detail.Quantity,
                    ReferenceId = order.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = admin.Id
                });
            }

            order.Cancelled = true;
            order.ModifiedAt = DateTime.UtcNow;
            order.ModifiedBy = admin.Id;

            _unitOfWork.Orders.Update(order);
            await _unitOfWork.Commit();
            _logger.LogInformation("Se anuló la venta {OrderId}", order.Id);
        }
        catch
        {
            await _unitOfWork.Rollback();
            throw;
        }
    }

    private static OrderResponseDto Map(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            Number = order.Number,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer.Name,
            SellerId = order.UserId,
            SellerName = order.User.Name,
            PaymentMethodId = order.PaymentMethodId,
            PaymentMethodName = order.PaymentMethod.Name,
            Date = order.Date,
            Total = order.Total,
            Cancelled = order.Cancelled,
            CreatedAt = order.CreatedAt,
            CreatedBy = order.CreatedBy,
            ModifiedAt = order.ModifiedAt,
            ModifiedBy = order.ModifiedBy,
            Details = order.Details.Select(detail => new OrderDetailResponseDto
            {
                ProductId = detail.ProductId,
                ProductCode = detail.Product.Code,
                ProductDescription = detail.Product.Description,
                Quantity = detail.Quantity,
                SalePrice = detail.SalePrice,
                PurchasePrice = detail.PurchasePrice,
                Subtotal = detail.Subtotal
            }).ToList()
        };
    }

    private static OrderFilterData NormalizeFilters(OrderFilterRequest? filters)
    {
        var dateFrom = filters?.DateFrom;
        var dateTo = filters?.DateTo;
        var customerId = filters?.CustomerId;
        var sellerId = filters?.SellerId;
        var number = filters?.Number;

        if (dateFrom.HasValue && dateTo.HasValue && dateFrom.Value.Date > dateTo.Value.Date)
            throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta");

        if (customerId.HasValue && customerId.Value <= 0)
            throw new ArgumentException("El filtro de cliente debe ser mayor que cero");

        if (sellerId.HasValue && sellerId.Value <= 0)
            throw new ArgumentException("El filtro de vendedor debe ser mayor que cero");

        if (number.HasValue && number.Value <= 0)
            throw new ArgumentException("El filtro de número de venta debe ser mayor que cero");

        DateTime? dateToInclusive = null;
        if (dateTo.HasValue)
        {
            dateToInclusive = dateTo.Value.Date == DateTime.MaxValue.Date
                ? DateTime.MaxValue
                : dateTo.Value.Date.AddDays(1).AddTicks(-1);
        }

        return new OrderFilterData(dateFrom, dateToInclusive, customerId, sellerId, number);
    }

    private static OrderData NormalizeAndValidate(CreateOrderRequest request)
    {
        if (request.CustomerId <= 0)
            throw new ArgumentException("El cliente es obligatorio");

        if (request.SellerId <= 0)
            throw new ArgumentException("El vendedor es obligatorio");

        if (request.PaymentMethodId <= 0)
            throw new ArgumentException("El medio de pago es obligatorio");

        if (request.UserId <= 0)
            throw new ArgumentException("El usuario que registra la venta es obligatorio");

        if (request.Date == default)
            throw new ArgumentException("La fecha de la venta es obligatoria");

        if (request.Details is null || request.Details.Count == 0)
            throw new ArgumentException("La venta debe contener al menos un detalle");

        var duplicateProductId = request.Details
            .GroupBy(detail => detail.ProductId)
            .FirstOrDefault(group => group.Count() > 1)?.Key;

        if (duplicateProductId.HasValue)
        {
            throw new ArgumentException(
                $"El producto con ID {duplicateProductId.Value} está repetido en los detalles de la venta");
        }

        var details = request.Details.Select(detail =>
        {
            if (detail.ProductId <= 0)
                throw new ArgumentException("Cada detalle debe indicar un producto válido");

            if (detail.Quantity <= 0)
                throw new ArgumentException("La cantidad de cada detalle debe ser mayor que cero");

            return new OrderDetailData(detail.ProductId, detail.Quantity);
        }).ToList();

        return new OrderData(request.CustomerId, request.SellerId, request.PaymentMethodId, request.Date, details);
    }

    private static void ValidateAmount(decimal amount, string fieldName)
    {
        if (amount < 0)
            throw new ArgumentException($"{fieldName} no puede ser negativo");

        if (amount > MaxAmount)
            throw new ArgumentException($"{fieldName} no puede superar los {MaxAmount:0.00}");

        if (decimal.Round(amount, 2) != amount)
            throw new ArgumentException($"{fieldName} no puede tener más de 2 decimales");
    }

    private sealed record OrderFilterData(DateTime? DateFrom, DateTime? DateToInclusive, int? CustomerId, int? SellerId, int? Number);
    private sealed record OrderData(int CustomerId, int SellerId, int PaymentMethodId, DateTime Date, List<OrderDetailData> Details);
    private sealed record OrderDetailData(int ProductId, int Quantity);
}
