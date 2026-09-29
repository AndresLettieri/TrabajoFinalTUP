using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class ProductRepository : RepositoryBase<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsByCode(string code, int? excludedProductId = null)
    {
        return await _dbSet.AnyAsync(p =>
            p.Code.ToLower() == code.ToLower()
            && (!excludedProductId.HasValue || p.Id != excludedProductId.Value));
    }

    public async Task<bool> ExistsByBarcode(string barcode, int? excludedProductId = null)
    {
        return await _dbSet.AnyAsync(p =>
            p.Barcode != null
            && p.Barcode.ToLower() == barcode.ToLower()
            && (!excludedProductId.HasValue || p.Id != excludedProductId.Value));
    }

    public async Task<IEnumerable<Product>> GetActiveProducts()
    {
        return await _dbSet
            .Where(p => p.Active)
            .OrderBy(p => p.Description)
            .ThenBy(p => p.Code)
            .ToListAsync();
    }

    public async Task<Product?> GetActiveProductById(int id)
    {
        return await _dbSet
            .Where(p => p.Id == id && p.Active)
            .FirstOrDefaultAsync();
    }
}
