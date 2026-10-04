namespace DistribuidoraAPI.DTOs.Purchase;

public class PurchaseResponseDto
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public required string VendorName { get; set; }
    public int Number { get; set; }
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public string? Observations { get; set; }
    public bool Cancelled { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
    public List<PurchaseDetailResponseDto> Details { get; set; } = [];
}
