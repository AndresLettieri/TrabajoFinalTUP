using DistribuidoraAPI.DTOs.Order;

namespace DistribuidoraAPI.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponseDto>> GetAll(OrderFilterRequest? filters = null);
    Task<OrderResponseDto> GetById(int id);
    Task<OrderResponseDto> Create(CreateOrderRequest request);
    Task Cancel(int id, int userId);
}
