using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class PurchaseRepository : RepositoryBase<Purchase>, IPurchaseRepository
{
    public PurchaseRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsByVendorAndNumber(int vendorId, int number)
    {
        return await _dbSet.AnyAsync(p => p.VendorId == vendorId && p.Number == number);
    }

    public async Task<IEnumerable<Purchase>> Search(DateTime? dateFrom, DateTime? dateToInclusive, int? vendorId, int? number)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(p => p.Vendor)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .AsQueryable();

        if (dateFrom.HasValue)
            query = query.Where(p => p.Date >= dateFrom.Value);

        if (dateToInclusive.HasValue)
            query = query.Where(p => p.Date <= dateToInclusive.Value);

        if (vendorId.HasValue)
            query = query.Where(p => p.VendorId == vendorId.Value);

        if (number.HasValue)
            query = query.Where(p => p.Number == number.Value);

        return await query
            .OrderByDescending(p => p.Date)
            .ThenByDescending(p => p.Id)
            .ToListAsync();
    }

    public async Task<Purchase?> GetByIdWithDetails(int id)
    {
        return await _dbSet
            .Include(p => p.Vendor)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}
