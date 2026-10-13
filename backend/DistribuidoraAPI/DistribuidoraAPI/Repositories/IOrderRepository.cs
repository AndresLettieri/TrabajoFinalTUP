using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Order;
using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<int> GetNextNumber();
    Task<IEnumerable<Order>> GetSalesBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int? customerId = null, int? sellerId = null);
    Task<Order?> GetByIdWithDetails(int id);
    Task<IEnumerable<TopProductDto>> GetTopProductsBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int topN);

    Task<IEnumerable<TopCategoryDto>> GetTopCategoriesBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int topN);

    Task<PagedResultDto<Order>> GetFilteredOrders(OrderFilterRequest filter);

}
