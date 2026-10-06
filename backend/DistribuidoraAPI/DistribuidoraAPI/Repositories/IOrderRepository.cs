using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IOrderRepository : IRepository<Order>
{
    Task<int> GetNextNumber();
    Task<IEnumerable<Order>> Search(DateTime? dateFrom, DateTime? dateToInclusive, int? customerId, int? sellerId, int? number);
    Task<IEnumerable<Order>> GetSalesBetweenDates(DateTime dateFrom, DateTime dateToInclusive, int? customerId = null, int? sellerId = null);
    Task<Order?> GetByIdWithDetails(int id);
}
