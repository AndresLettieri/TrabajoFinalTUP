namespace DistribuidoraAPI.DTOs.Order;

public class OrderDetailResponseDto
{
    public int ProductId { get; set; }
    public required string ProductCode { get; set; }
    public required string ProductDescription { get; set; }
    public int Quantity { get; set; }
    public decimal SalePrice { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal Subtotal { get; set; }
}
