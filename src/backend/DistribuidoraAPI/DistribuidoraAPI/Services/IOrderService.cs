using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Order;
using DistribuidoraAPI.DTOs.Reports;

namespace DistribuidoraAPI.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAll();
    Task<SalesReportResponseDto> GetSalesReport(DateTime? dateFrom, DateTime? dateTo, int? customerId = null, int? sellerId = null);
    Task<ProfitReportResponseDto> GetProfitReport(DateTime? dateFrom, DateTime? dateTo);
    Task<OrderResponseDto> GetById(int id);
    Task<OrderResponseDto> Create(CreateOrderRequest request);
    Task Cancel(int id, int userId);
    Task<List<TopProductDto>> GetTopProductsReport(DateTime? dateFrom, DateTime? dateTo, int topN = 10);
    Task<List<TopCategoryDto>> GetTopCategoriesReport(DateTime? dateFrom, DateTime? dateTo, int topN = 10);
    Task<List<TopCategoryDto>> GetProfitByCategory(DateTime? dateFrom, DateTime? dateTo);
    Task<PagedResultDto<OrderResponseDto>> GetByFilter(OrderFilterRequest filter);


}
