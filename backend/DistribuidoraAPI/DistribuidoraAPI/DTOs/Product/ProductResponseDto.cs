namespace DistribuidoraAPI.DTOs.Product;

public class ProductResponseDto
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public string? Barcode { get; set; }
    public required string Description { get; set; }
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public int Stock { get; set; }
    public int MinimumStock { get; set; }

    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
}
