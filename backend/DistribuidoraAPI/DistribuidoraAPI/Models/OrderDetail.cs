namespace DistribuidoraAPI.Models;

public class OrderDetail
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal SalePrice { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal Subtotal { get; set; }

    public Order Order { get; set; } = null!;

    public Product Product { get; set; } = null!;
}