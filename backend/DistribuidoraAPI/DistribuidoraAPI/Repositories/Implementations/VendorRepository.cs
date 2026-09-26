using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class VendorRepository : RepositoryBase<Vendor>, IVendorRepository
{
    public VendorRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Vendor>> GetActiveVendors()
    {
        return await _dbSet
            .Where(v => v.Active)
            .OrderBy(v => v.Name)
            .ToListAsync();
    }

    public async Task<Vendor?> GetActiveVendorById(int id)
    {
        return await _dbSet
            .Where(v => v.Id == id && v.Active)
            .FirstOrDefaultAsync();
    }
}
