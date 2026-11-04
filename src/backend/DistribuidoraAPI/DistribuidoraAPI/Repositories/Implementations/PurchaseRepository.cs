using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Purchase;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

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

    public async Task<IEnumerable<Purchase>> GetActivePurchases()
    {
        return await _dbSet
            .Include(p => p.Vendor)
            .Include(p => p.Details)
                .ThenInclude(d => d.Product)
            .Where(p => !p.Cancelled)
            .OrderBy(p => p.Date)
            .ThenBy(p => p.Number)
            .ToListAsync();
    }

    public async Task<PagedResultDto<Purchase>> GetFilteredPurchases(PurchaseFilterRequest filter) {
        var query = _dbSet
           .AsNoTracking()
           .Include(p => p.Vendor)
           .Include(p => p.Details)
               .ThenInclude(d => d.Product)
           .AsQueryable();

        if (filter.DateFrom.HasValue)
            query = query.Where(p => p.Date >= filter.DateFrom.Value);

        if (filter.DateTo.HasValue)
            query = query.Where(p => p.Date <= filter.DateTo.Value);

        if (filter.VendorId.HasValue)
            query = query.Where(p => p.VendorId == filter.VendorId.Value);

        if (filter.Number.HasValue)
            query = query.Where(p => p.Number == filter.Number.Value);
        var totalItems = await query.CountAsync();
        var purchases = await query
            .OrderBy(p => p.Date)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();
        return new PagedResultDto<Purchase>
        {
            Items = purchases,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
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
