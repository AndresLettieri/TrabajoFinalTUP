using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IVendorRepository : IRepository<Vendor>
{
    Task<IEnumerable<Vendor>> GetActiveVendors();
    Task<Vendor?> GetActiveVendorById(int id);
}
