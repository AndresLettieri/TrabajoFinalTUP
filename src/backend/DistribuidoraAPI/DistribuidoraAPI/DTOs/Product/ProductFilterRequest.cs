namespace DistribuidoraAPI.DTOs.Product;

public class ProductFilterRequest
{
    public string? Code { get; set; }
    public string? Barcode { get; set; }
    public string? Description { get; set; }
    public int? CategoryId { get; set; }
    public int? BrandId { get; set; }
    public bool? Active { get; set; }
}
