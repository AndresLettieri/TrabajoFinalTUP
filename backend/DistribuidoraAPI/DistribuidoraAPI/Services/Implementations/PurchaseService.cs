using DistribuidoraAPI.DTOs.Purchase;
using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Enums;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class PurchaseService : IPurchaseService
{
    private const int ObservationsMaxLength = 1500;
    private const decimal MaxAmount = 9_999_999_999.99m;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PurchaseService> _logger;

    public PurchaseService(IUnitOfWork unitOfWork, ILogger<PurchaseService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<PurchaseResponseDto>> GetAll(PurchaseFilterRequest? filters = null)
    {
        var normalizedFilters = NormalizeFilters(filters);
        var purchases = await _unitOfWork.Purchases.Search(
            normalizedFilters.DateFrom,
            normalizedFilters.DateToInclusive,
            normalizedFilters.VendorId,
            normalizedFilters.Number);

        return purchases.Select(Map).ToList();
    }

    public async Task<PurchaseReportResponseDto> GetPurchaseReport(DateTime? dateFrom, DateTime? dateTo, int? vendorId = null)
    {
        if (!dateFrom.HasValue || !dateTo.HasValue)
            throw new ArgumentException("Las fechas desde y hasta son obligatorias");

        if (dateFrom.Value.Date > dateTo.Value.Date)
            throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta");

        if (vendorId.HasValue && vendorId.Value <= 0)
            throw new ArgumentException("El proveedor debe ser mayor que cero");

        var purchases = (await GetAll(new PurchaseFilterRequest
        {
            DateFrom = dateFrom.Value.Date,
            DateTo = dateTo.Value.Date,
            VendorId = vendorId
        })).ToList();

        return new PurchaseReportResponseDto
        {
            DateFrom = dateFrom.Value.Date,
            DateTo = dateTo.Value.Date,
            PurchaseCount = purchases.Count,
            TotalAmount = purchases.Sum(purchase => purchase.Total),
            Purchases = purchases
        };
    }

    public async Task<PurchaseResponseDto> GetById(int id)
    {
        var purchase = await _unitOfWork.Purchases.GetByIdWithDetails(id);

        if (purchase is null)
            throw new KeyNotFoundException($"No se encontró la compra con ID {id}");

        return Map(purchase);
    }

    public async Task<PurchaseResponseDto> Create(CreatePurchaseRequest request)
    {
        var data = NormalizeAndValidate(request);

        await _unitOfWork.BeginTransaction();
        try
        {
            var vendor = await _unitOfWork.Vendors.GetActiveVendorById(data.VendorId);
            if (vendor is null)
                throw new KeyNotFoundException($"No se encontró un proveedor activo con ID {data.VendorId}");

            if (await _unitOfWork.Purchases.ExistsByVendorAndNumber(data.VendorId, data.Number))
            {
                throw new InvalidOperationException(
                    $"Ya existe el comprobante {data.Number} para el proveedor indicado");
            }

            var purchaseDetails = new List<PurchaseDetail>();
            var productsById = new Dictionary<int, Product>();
            decimal total = 0;

            foreach (var detail in data.Details)
            {
                var product = await _unitOfWork.Products.GetActiveProductById(detail.ProductId);
                if (product is null)
                    throw new KeyNotFoundException($"No se encontró un producto activo con ID {detail.ProductId}");

                if (product.Stock > int.MaxValue - detail.Quantity)
                {
                    throw new InvalidOperationException(
                        $"La cantidad supera el stock máximo permitido para el producto {product.Code}");
                }

                var subtotal = detail.PurchasePrice * detail.Quantity;
                ValidateAmount(subtotal, $"El subtotal del producto {product.Code}");

                total += subtotal;
                ValidateAmount(total, "El total de la compra");

                productsById.Add(product.Id, product);
                purchaseDetails.Add(new PurchaseDetail
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = detail.Quantity,
                    PurchasePrice = detail.PurchasePrice,
                    Subtotal = subtotal
                });
            }

            var purchase = new Purchase
            {
                VendorId = vendor.Id,
                Vendor = vendor,
                Number = data.Number,
                Date = data.Date,
                Total = total,
                Observations = data.Observations,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.UserId,
                Details = purchaseDetails
            };

            _unitOfWork.Purchases.Add(purchase);
            await _unitOfWork.SaveChanges();

            foreach (var detail in purchase.Details)
            {
                var product = productsById[detail.ProductId];
                product.Stock += detail.Quantity;

                _unitOfWork.GetRepository<StockMovement>().Add(new StockMovement
                {
                    ProductId = product.Id,
                    Product = product,
                    Type = StockMovementType.Purchase,
                    Quantity = detail.Quantity,
                    ReferenceId = purchase.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = request.UserId
                });
            }

            await _unitOfWork.Commit();
            _logger.LogInformation("Se registró la compra {PurchaseId} con comprobante {Number}", purchase.Id, purchase.Number);

            return Map(purchase);
        }
        catch
        {
            await _unitOfWork.Rollback();
            throw;
        }
    }

    public async Task Cancel(int id, int userId)
    {
        await _unitOfWork.BeginTransaction();
        try
        {
            var purchase = await _unitOfWork.Purchases.GetByIdWithDetails(id);

            if (purchase is null)
                throw new KeyNotFoundException($"No se encontró la compra con ID {id}");

            if (purchase.Cancelled)
                throw new InvalidOperationException($"La compra con ID {id} ya está anulada");

            foreach (var detail in purchase.Details)
            {
                if (detail.Product.Stock < detail.Quantity)
                {
                    throw new InvalidOperationException(
                        $"No se puede anular la compra: el stock actual de '{detail.Product.Description}' es insuficiente para revertirla");
                }
            }

            foreach (var detail in purchase.Details)
            {
                detail.Product.Stock -= detail.Quantity;

                _unitOfWork.GetRepository<StockMovement>().Add(new StockMovement
                {
                    ProductId = detail.ProductId,
                    Product = detail.Product,
                    Type = StockMovementType.PurchaseCancellation,
                    Quantity = detail.Quantity,
                    ReferenceId = purchase.Id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                });
            }

            purchase.Cancelled = true;
            purchase.ModifiedAt = DateTime.UtcNow;
            purchase.ModifiedBy = userId;

            _unitOfWork.Purchases.Update(purchase);
            await _unitOfWork.Commit();
            _logger.LogInformation("Se anuló la compra {PurchaseId}", purchase.Id);
        }
        catch
        {
            await _unitOfWork.Rollback();
            throw;
        }
    }

    private static PurchaseResponseDto Map(Purchase purchase)
    {
        return new PurchaseResponseDto
        {
            Id = purchase.Id,
            VendorId = purchase.VendorId,
            VendorName = purchase.Vendor.Name,
            Number = purchase.Number,
            Date = purchase.Date,
            Total = purchase.Total,
            Observations = purchase.Observations,
            Cancelled = purchase.Cancelled,
            CreatedAt = purchase.CreatedAt,
            CreatedBy = purchase.CreatedBy,
            ModifiedAt = purchase.ModifiedAt,
            ModifiedBy = purchase.ModifiedBy,
            Details = purchase.Details.Select(detail => new PurchaseDetailResponseDto
            {
                ProductId = detail.ProductId,
                ProductCode = detail.Product.Code,
                ProductDescription = detail.Product.Description,
                Quantity = detail.Quantity,
                PurchasePrice = detail.PurchasePrice,
                Subtotal = detail.Subtotal
            }).ToList()
        };
    }

    private static PurchaseFilterData NormalizeFilters(PurchaseFilterRequest? filters)
    {
        var dateFrom = filters?.DateFrom;
        var dateTo = filters?.DateTo;
        var vendorId = filters?.VendorId;
        var number = filters?.Number;

        if (dateFrom.HasValue && dateTo.HasValue && dateFrom.Value.Date > dateTo.Value.Date)
            throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta");

        if (vendorId.HasValue && vendorId.Value <= 0)
            throw new ArgumentException("El filtro de proveedor debe ser mayor que cero");

        if (number.HasValue && number.Value <= 0)
            throw new ArgumentException("El filtro de comprobante debe ser mayor que cero");

        DateTime? dateToInclusive = null;
        if (dateTo.HasValue)
        {
            dateToInclusive = dateTo.Value.Date == DateTime.MaxValue.Date
                ? DateTime.MaxValue
                : dateTo.Value.Date.AddDays(1).AddTicks(-1);
        }

        return new PurchaseFilterData(dateFrom, dateToInclusive, vendorId, number);
    }

    private static PurchaseData NormalizeAndValidate(CreatePurchaseRequest request)
    {
        if (request.VendorId <= 0)
            throw new ArgumentException("El proveedor es obligatorio");

        if (request.Number <= 0)
            throw new ArgumentException("El número de comprobante debe ser mayor que cero");

        if (request.Date == default)
            throw new ArgumentException("La fecha de la compra es obligatoria");

        var observations = string.IsNullOrWhiteSpace(request.Observations)
            ? null
            : request.Observations.Trim();

        if (observations?.Length > ObservationsMaxLength)
            throw new ArgumentException($"Las observaciones no pueden superar los {ObservationsMaxLength} caracteres");

        if (request.Details is null || request.Details.Count == 0)
            throw new ArgumentException("La compra debe contener al menos un detalle");

        var duplicateProductId = request.Details
            .GroupBy(detail => detail.ProductId)
            .FirstOrDefault(group => group.Count() > 1)?.Key;

        if (duplicateProductId.HasValue)
        {
            throw new ArgumentException(
                $"El producto con ID {duplicateProductId.Value} está repetido en los detalles de la compra");
        }

        var details = request.Details.Select(detail =>
        {
            if (detail.ProductId <= 0)
                throw new ArgumentException("Cada detalle debe indicar un producto válido");

            if (detail.Quantity <= 0)
                throw new ArgumentException("La cantidad de cada detalle debe ser mayor que cero");

            ValidateAmount(detail.PurchasePrice, "El precio de compra");

            return new PurchaseDetailData(detail.ProductId, detail.Quantity, detail.PurchasePrice);
        }).ToList();

        return new PurchaseData(request.VendorId, request.Number, request.Date, observations, details);
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

    private sealed record PurchaseFilterData(DateTime? DateFrom, DateTime? DateToInclusive, int? VendorId, int? Number);
    private sealed record PurchaseData(int VendorId, int Number, DateTime Date, string? Observations, List<PurchaseDetailData> Details);
    private sealed record PurchaseDetailData(int ProductId, int Quantity, decimal PurchasePrice);
}
