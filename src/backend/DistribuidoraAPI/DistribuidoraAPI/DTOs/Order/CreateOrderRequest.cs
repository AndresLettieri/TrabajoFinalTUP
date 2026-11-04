using DistribuidoraAPI.DTOs;

namespace DistribuidoraAPI.DTOs.Order;

public class CreateOrderRequest : AuditUserDto
{
    public int CustomerId { get; set; }
    public int SellerId { get; set; }
    public int PaymentMethodId { get; set; }
    public DateTime Date { get; set; }
    public List<CreateOrderDetailRequest> Details { get; set; } = [];
}
