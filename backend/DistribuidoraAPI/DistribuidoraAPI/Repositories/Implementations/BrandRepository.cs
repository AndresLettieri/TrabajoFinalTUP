using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Brand;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class BrandRepository : RepositoryBase<Brand>, IBrandRepository
{
    public BrandRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Brand?> GetByName(string name)
    {
        return await _dbSet
            .Where(b => b.Active && b.Name.ToLower() == name.ToLower())
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsByName(string name)
    {
        return await _dbSet
            .AnyAsync(b => b.Active && b.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Brand>> GetActiveBrands()
    {
        return await _dbSet
            .Where(b => b.Active)
            .OrderBy(b => b.Name)
            .ToListAsync();
    }

    public async Task<Brand?> GetActiveBrandById(int id)
    {
        return await _dbSet
            .Where(b => b.Id == id && b.Active)
            .FirstOrDefaultAsync();
    }

    public async Task<PagedResultDto<Brand>> GetFilteredBrands(BrandFilterDto filter)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Name))
            query = query.Where(b =>
                b.Name.ToLower().Contains(filter.Name.ToLower()));

        if (filter.Active.HasValue)
            query = query.Where(b =>
                b.Active == filter.Active.Value);

        var totalItems = await query.CountAsync();

        var brands = await query
            .OrderBy(b => b.Name)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResultDto<Brand>
        {
            Items = brands,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }
}
