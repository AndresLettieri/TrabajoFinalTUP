using DistribuidoraAPI.DTOs.Order;

namespace DistribuidoraAPI.DTOs.Reports;

public class SalesReportResponseDto
{
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    public int SalesCount { get; set; }
    public decimal TotalAmount { get; set; }
    public List<OrderResponseDto> Sales { get; set; } = [];
}
