namespace DistribuidoraAPI.DTOs.Product;

public class UpdateProductRequest
{
    public required string Code { get; set; }
    public string? Barcode { get; set; }
    public required string Description { get; set; }
    public int CategoryId { get; set; }
    public int BrandId { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public int MinimumStock { get; set; }
    public int UserId { get; set; }
}
