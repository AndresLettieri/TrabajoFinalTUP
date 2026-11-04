using DistribuidoraAPI.DTOs.Purchase;

namespace DistribuidoraAPI.DTOs.Reports;

public class PurchaseReportResponseDto
{
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    public int PurchaseCount { get; set; }
    public decimal TotalAmount { get; set; }
    public List<PurchaseResponseDto> Purchases { get; set; } = [];
}
