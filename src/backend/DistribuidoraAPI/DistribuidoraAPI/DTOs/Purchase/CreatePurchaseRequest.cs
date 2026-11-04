using DistribuidoraAPI.DTOs;

namespace DistribuidoraAPI.DTOs.Purchase;

public class CreatePurchaseRequest : AuditUserDto
{
    public int VendorId { get; set; }
    public int Number { get; set; }
    public DateTime Date { get; set; }
    public string? Observations { get; set; }
    public List<CreatePurchaseDetailRequest> Details { get; set; } = [];
}
