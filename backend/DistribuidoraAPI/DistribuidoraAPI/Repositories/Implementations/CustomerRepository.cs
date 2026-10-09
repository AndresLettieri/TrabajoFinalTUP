using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Customer;
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

    public async Task<PagedResultDto<Customer>> GetFilteredCustomers(CustomerFilterDto filter)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Name))
            query = query.Where(c =>
                c.Name.ToLower().Contains(filter.Name.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Document))
            query = query.Where(c =>
                c.Document.ToLower().Contains(filter.Document.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Phone))
            query = query.Where(c =>
                c.Phone != null &&
                c.Phone.ToLower().Contains(filter.Phone.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Email))
            query = query.Where(c =>
                c.Email != null &&
                c.Email.ToLower().Contains(filter.Email.ToLower()));

        if (filter.Active.HasValue)
            query = query.Where(c =>
                c.Active == filter.Active.Value);

        var totalItems = await query.CountAsync();

        var customers = await query
            .OrderBy(c => c.Name)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResultDto<Customer>
        {
            Items = customers,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }
}
