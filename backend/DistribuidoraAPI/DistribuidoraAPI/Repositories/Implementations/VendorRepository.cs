using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Vendor;
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

    public async Task<PagedResultDto<Vendor>> GetFilteredVendors(VendorFilterDto filter)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Name))
            query = query.Where(v =>
                v.Name.ToLower().Contains(filter.Name.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Phone))
            query = query.Where(v =>
                v.Phone.ToLower().Contains(filter.Phone.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.Email))
            query = query.Where(v =>
                v.Email.ToLower().Contains(filter.Email.ToLower()));

        if (!string.IsNullOrWhiteSpace(filter.City))
            query = query.Where(v =>
                v.City.ToLower().Contains(filter.City.ToLower()));

        if (filter.Active.HasValue)
            query = query.Where(v =>
                v.Active == filter.Active.Value);

        var totalItems = await query.CountAsync();

        var vendors = await query
            .OrderBy(v => v.Name)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResultDto<Vendor>
        {
            Items = vendors,
            TotalItems = totalItems,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
        };
    }
}