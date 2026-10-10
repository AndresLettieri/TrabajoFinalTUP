using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Vendor;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IVendorRepository : IRepository<Vendor>
{
    Task<IEnumerable<Vendor>> GetActiveVendors();
    Task<Vendor?> GetActiveVendorById(int id);
    Task<PagedResultDto<Vendor>> GetFilteredVendors(VendorFilterDto filter);
}
