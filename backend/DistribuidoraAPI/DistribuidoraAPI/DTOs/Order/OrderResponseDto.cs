namespace DistribuidoraAPI.DTOs.Order;

public class OrderResponseDto
{
    public int Id { get; set; }
    public int Number { get; set; }
    public int CustomerId { get; set; }
    public required string CustomerName { get; set; }
    public int SellerId { get; set; }
    public required string SellerName { get; set; }
    public int PaymentMethodId { get; set; }
    public required string PaymentMethodName { get; set; }
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public bool Cancelled { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
    public List<OrderDetailResponseDto> Details { get; set; } = [];
}
