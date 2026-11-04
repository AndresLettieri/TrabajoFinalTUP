using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations;

public class PaymentMethodRepository : RepositoryBase<PaymentMethod>, IPaymentMethodRepository
{
    public PaymentMethodRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<PaymentMethod?> GetByName(string name)
    {
        return await _dbSet
            .Where(pm => pm.Active && pm.Name.ToLower() == name.ToLower())
            .FirstOrDefaultAsync();
    }

    public async Task<bool> ExistsByName(string name)
    {
        return await _dbSet
            .AnyAsync(pm => pm.Active && pm.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<PaymentMethod>> GetActivePaymentMethods()
    {
        return await _dbSet
            .Where(pm => pm.Active)
            .OrderBy(pm => pm.Name)
            .ToListAsync();
    }

    public async Task<PaymentMethod?> GetActivePaymentMethodById(int id)
    {
        return await _dbSet
            .Where(pm => pm.Id == id && pm.Active)
            .FirstOrDefaultAsync();
    }
}
