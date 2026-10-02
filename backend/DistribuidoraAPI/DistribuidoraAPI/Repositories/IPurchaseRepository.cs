using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<bool> ExistsByVendorAndNumber(int vendorId, int number);
    Task<IEnumerable<Purchase>> Search(DateTime? dateFrom, DateTime? dateToInclusive, int? vendorId, int? number);
    Task<Purchase?> GetByIdWithDetails(int id);
}
