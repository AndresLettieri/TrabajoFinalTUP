namespace DistribuidoraAPI.DTOs.Purchase;

public class CreatePurchaseDetailRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal PurchasePrice { get; set; }
}
