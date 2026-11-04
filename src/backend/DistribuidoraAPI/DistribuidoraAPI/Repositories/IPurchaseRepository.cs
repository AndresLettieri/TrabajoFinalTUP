using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Purchase;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<bool> ExistsByVendorAndNumber(int vendorId, int number);
    Task<IEnumerable<Purchase>> GetActivePurchases();
    Task<Purchase?> GetByIdWithDetails(int id);
    Task<PagedResultDto<Purchase>> GetFilteredPurchases(PurchaseFilterRequest filter);

}
