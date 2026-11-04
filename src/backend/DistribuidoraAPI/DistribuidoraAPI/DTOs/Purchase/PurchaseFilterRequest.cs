namespace DistribuidoraAPI.DTOs.Purchase;

public class PurchaseFilterRequest : PaginationRequestDto
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int? VendorId { get; set; }
    public int? Number { get; set; }
}
