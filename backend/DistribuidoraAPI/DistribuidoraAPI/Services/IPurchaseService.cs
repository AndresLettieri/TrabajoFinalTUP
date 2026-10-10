using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Purchase;
using DistribuidoraAPI.DTOs.Reports;

namespace DistribuidoraAPI.Services;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseResponseDto>> GetAll();
    Task<PurchaseReportResponseDto> GetPurchaseReport(DateTime? dateFrom, DateTime? dateTo, int? vendorId = null);
    Task<PurchaseResponseDto> GetById(int id);
    Task<PurchaseResponseDto> Create(CreatePurchaseRequest request);
    Task Cancel(int id, int userId);
    Task<PagedResultDto<PurchaseResponseDto>> GetByFilter(PurchaseFilterRequest filter);

}
