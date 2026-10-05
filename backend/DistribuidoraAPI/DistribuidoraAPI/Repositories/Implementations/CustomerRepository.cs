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

    public async Task<IEnumerable<Customer>> GetFilteredCustomers(string? name, string? document, string? phone, string? email, bool? active)
    {
        var query = _dbSet.AsQueryable();
        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(c => c.Name.ToLower().Contains(name.ToLower()));
        if (!string.IsNullOrWhiteSpace(document))
            query = query.Where(c => c.Document.ToLower().Contains(document.ToLower()));
        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(c => c.Phone != null && c.Phone.ToLower().Contains(phone.ToLower()));
        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(c => c.Email != null && c.Email.ToLower().Contains(email.ToLower()));
        if (active.HasValue)
            query = query.Where(c => c.Active == active.Value);
        return await query.OrderBy(c => c.Name).ToListAsync();
    }
}
