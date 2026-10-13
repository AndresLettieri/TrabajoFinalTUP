using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Order;
using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class OrderRepository : RepositoryBase<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<int> GetNextNumber()
    {
        var lastNumber = await _dbSet.MaxAsync(order => (int?)order.Number) ?? 0;

        if (lastNumber == int.MaxValue)
            throw new InvalidOperationException("Se alcanzó el máximo número de comprobante permitido");

        return lastNumber + 1;
    }

    public async Task<IEnumerable<TopProductDto>> GetTopProductsBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int topN)
    {
        var query = _dbSet
            .AsNoTracking()
            .Where(order => !order.Cancelled && order.Date >= dateFrom && order.Date <= dateToInclusive)
            .SelectMany(order => order.Details)
            .GroupBy(detail => detail.ProductId)
            .Select(group => new TopProductDto
            {
                ProductCode = group.First().Product.Code,
                ProductDescription = group.First().Product.Description,
                CategoryName = group.First().Product.Category.Name,
                TotalQuantitySold = group.Sum(detail => detail.Quantity),
                TotalSales = group.Sum(detail => detail.Quantity * detail.SalePrice),
                TotalProfit = group.Sum(detail => (detail.SalePrice - detail.PurchasePrice) * detail.Quantity)
            })
            .OrderByDescending(dto => dto.TotalQuantitySold)
            .Take(topN);
        return await query.ToListAsync();
    }

    public async Task<IEnumerable<TopCategoryDto>> GetTopCategoriesBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int topN)
    {
        var query = _dbSet
            .AsNoTracking()
            .Where(order => !order.Cancelled && order.Date >= dateFrom && order.Date <= dateToInclusive)
            .SelectMany(order => order.Details)
            .GroupBy(detail => detail.Product.CategoryId)
            .Select(group => new TopCategoryDto
            {
                CategoryName = group.First().Product.Category.Name,
                TotalQuantitySold = group.Sum(detail => detail.Quantity),
                TotalSales = group.Sum(detail => detail.Quantity * detail.SalePrice),
                TotalProfit = group.Sum(detail => (detail.SalePrice - detail.PurchasePrice) * detail.Quantity)
            })
            .OrderByDescending(dto => dto.TotalQuantitySold)
            .Take(topN);
        return await query.ToListAsync();
    }

    public async Task<PagedResultDto<Order>> GetFilteredOrders(OrderFilterRequest filter)
    {
        var query = _dbSet
           .AsNoTracking()
           .Include(p => p.Customer)
           .Include(p => p.User)
           .Include(p => p.PaymentMethod)
           .Include(p => p.Details)
               .ThenInclude(d => d.Product)
           .AsQueryable();

        if (filter.DateFrom.HasValue)
            query = query.Where(p => p.Date >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(p => p.Date <= filter.DateTo.Value);

        if (filter.CustomerId.HasValue)
            query = query.Where(p => p.CustomerId == filter.CustomerId.Value);

        if (filter.SellerId.HasValue)
            query = query.Where(p => p.UserId == filter.SellerId.Value);

        if (filter.Number.HasValue)
            query = query.Where(p => p.Number == filter.Number.Value);
        var totalItems = await query.CountAsync();
        var orders = await query
            .OrderBy(p => p.Date)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();
        return new PagedResultDto<Order>
        {
            Items = orders,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }

    public async Task<IEnumerable<Order>> Search(DateTime? dateFrom, DateTime? dateToInclusive, int? customerId, int? sellerId, int? number)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.PaymentMethod)
            .Include(order => order.Details)
                .ThenInclude(detail => detail.Product)
            .AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(order => order.Date >= dateFrom.Value);

        if (dateToInclusive.HasValue)
            query = query.Where(order => order.Date <= dateToInclusive.Value);

        if (customerId.HasValue)
            query = query.Where(order => order.CustomerId == customerId.Value);

        if (sellerId.HasValue)
            query = query.Where(order => order.UserId == sellerId.Value);

        if (number.HasValue)
            query = query.Where(order => order.Number == number.Value);

        return await query
            .OrderByDescending(order => order.Date)
            .ThenByDescending(order => order.Number)
            .ToListAsync();
    }

    public async Task<IEnumerable<Order>> GetSalesBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int? customerId = null, int? sellerId = null)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.PaymentMethod)
            .Include(order => order.Details)
                .ThenInclude(detail => detail.Product)
            .Where(order => !order.Cancelled && order.Date >= dateFrom && order.Date <= dateToInclusive)
            .AsQueryable();

        if (customerId.HasValue)
            query = query.Where(order => order.CustomerId == customerId.Value);

        if (sellerId.HasValue)
            query = query.Where(order => order.UserId == sellerId.Value);

        return await query
            .OrderByDescending(order => order.Date)
            .ThenByDescending(order => order.Number)
            .ToListAsync();
    }

    public async Task<Order?> GetByIdWithDetails(int id)
    {
        return await _dbSet
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.PaymentMethod)
            .Include(order => order.Details)
                .ThenInclude(detail => detail.Product)
            .FirstOrDefaultAsync(order => order.Id == id);
    }
}
