using DistribuidoraAPI.DTOs.Order;
using DistribuidoraAPI.DTOs.Reports;

namespace DistribuidoraAPI.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAll(OrderFilterRequest? filters = null);
    Task<SalesReportResponseDto> GetSalesReport(DateTime? dateFrom, DateTime? dateTo, int? customerId = null, int? sellerId = null);
    Task<ProfitReportResponseDto> GetProfitReport(DateTime? dateFrom, DateTime? dateTo);
    Task<OrderResponseDto> GetById(int id);
    Task<OrderResponseDto> Create(CreateOrderRequest request);
    Task Cancel(int id, int userId);
}
