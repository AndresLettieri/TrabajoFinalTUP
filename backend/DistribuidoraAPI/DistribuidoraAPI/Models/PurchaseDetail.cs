namespace DistribuidoraAPI.Models;

public class PurchaseDetail
{
    public int Id { get; set; }

    public int PurchaseId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal Subtotal { get; set; }

    public Purchase Purchase { get; set; } = null!;

    public Product Product { get; set; } = null!;
}