using DistribuidoraAPI.Data;
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
}
