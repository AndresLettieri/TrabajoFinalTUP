using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Category;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class CategoryRepository : RepositoryBase<Models.Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context)
    {
    }
    public async Task<Models.Category?> GetByName(string name)
    {
        return await _dbSet
            .Where(c => c.Active && c.Name.ToLower() == name.ToLower())
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsByName(string name)
    {
        return await _dbSet
            .AnyAsync(c => c.Active && c.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Models.Category>> GetActiveCategories()
    {
        return await _dbSet
            .Where(c => c.Active)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Models.Category?> GetActiveCategoryById(int id)
    {
        return await _dbSet
            .Where(c => c.Id == id && c.Active)
            .FirstOrDefaultAsync();
    }

    public async Task<PagedResultDto<Category>> GetFilteredCategories(CategoryFilterDto filter)
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

        return new PagedResultDto<Category>
        {
            Items = brands,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }
}
