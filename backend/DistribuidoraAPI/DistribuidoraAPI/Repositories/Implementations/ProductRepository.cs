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

    public async Task<IEnumerable<Product>> Search(string? code, string? barcode, string? description, int? categoryId, int? brandId, bool? active = true)
    {
        var query = _dbSet.AsQueryable();

        if (active.HasValue)
            query = query.Where(p => p.Active == active.Value);

        if (!string.IsNullOrWhiteSpace(code))
        {
            var normalizedCode = code.Trim().ToLower();
            query = query.Where(p => p.Code.ToLower() == normalizedCode);
        }

        if (!string.IsNullOrWhiteSpace(barcode))
        {
            var normalizedBarcode = barcode.Trim().ToLower();
            query = query.Where(p =>
                p.Barcode != null && p.Barcode.ToLower() == normalizedBarcode);
        }

        if (!string.IsNullOrWhiteSpace(description))
        {
            var normalizedDescription = description.Trim().ToLower();
            query = query.Where(p => p.Description.ToLower().Contains(normalizedDescription));
        }

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (brandId.HasValue)
            query = query.Where(p => p.BrandId == brandId.Value);

        return await query
            .OrderBy(p => p.Description)
            .ThenBy(p => p.Code)
            .ToListAsync();
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
