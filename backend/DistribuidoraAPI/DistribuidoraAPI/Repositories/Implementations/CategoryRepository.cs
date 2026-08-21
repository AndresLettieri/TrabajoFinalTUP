using DistribuidoraAPI.Data;
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
}
