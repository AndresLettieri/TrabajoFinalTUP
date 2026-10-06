using DistribuidoraAPI.Data;
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
