using DistribuidoraAPI.DTOs.Purchase;

namespace DistribuidoraAPI.Services;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseResponseDto>> GetAll(PurchaseFilterRequest? filters = null);
    Task<PurchaseResponseDto> GetById(int id);
    Task<PurchaseResponseDto> Create(CreatePurchaseRequest request);
    Task Cancel(int id, int userId);
}
