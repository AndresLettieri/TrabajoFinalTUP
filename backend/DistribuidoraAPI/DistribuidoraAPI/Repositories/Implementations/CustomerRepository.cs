using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class CustomerRepository : RepositoryBase<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsByDocument(string document)
    {
        return await _dbSet.AnyAsync(c => c.Document.ToLower() == document.ToLower());
    }

    public async Task<IEnumerable<Customer>> GetActiveCustomers()
    {
        return await _dbSet
            .Where(c => c.Active)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Customer?> GetActiveCustomerById(int id)
    {
        return await _dbSet
            .Where(c => c.Id == id && c.Active)
            .FirstOrDefaultAsync();
    }
}
