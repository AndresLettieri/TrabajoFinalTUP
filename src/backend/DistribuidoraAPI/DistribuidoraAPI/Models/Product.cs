using DistribuidoraAPI.Models;

public class Product : ActiveEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Description { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public int BrandId { get; set; }

    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }

    public int Stock { get; set; }
    public int MinimumStock { get; set; }

    public Category Category { get; set; } = null!;
    public Brand Brand { get; set; } = null!;
}