using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Product;
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

    public async Task<IEnumerable<Product>> GetStockAlerts()
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.Active && p.Stock <= p.MinimumStock)
            .OrderBy(p => p.Stock)
            .ThenBy(p => p.Description)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> GetActiveProducts()
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.Active)
            .OrderBy(p => p.Description)
            .ThenBy(p => p.Code)
            .ToListAsync();
    }

    public async Task<Product?> GetActiveProductById(int id)
    {
        return await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Where(p => p.Id == id && p.Active)
            .FirstOrDefaultAsync();
    }

    public async Task<PagedResultDto<Product>> GetFilteredProducts(ProductFilterDto filter)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Code))
            query = query.Where(c =>
                c.Code.ToLower().Contains(filter.Code.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Barcode))
            query = query.Where(c =>
                c.Barcode != null &&
                c.Barcode.ToLower().Contains(filter.Barcode.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Description))
            query = query.Where(c =>
                c.Description.ToLower().Contains(filter.Description.ToLower()));

        if (filter.Active.HasValue)
            query = query.Where(c =>
                c.Active == filter.Active.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(c =>
                c.CategoryId == filter.CategoryId.Value);

        if (filter.BrandId.HasValue)
            query = query.Where(c =>
                c.BrandId == filter.BrandId.Value);

        var totalItems = await query.CountAsync();

        var products = await query
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .OrderBy(c => c.Description)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResultDto<Product>
        {
            Items = products,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }
}
