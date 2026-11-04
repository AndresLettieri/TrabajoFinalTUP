using DistribuidoraAPI.DTOs.Product;

namespace DistribuidoraAPI.DTOs.Reports;

public class AdminDashboardResponseDto
{
    public DateTime Today { get; set; }
    public int SalesTodayCount { get; set; }
    public decimal SalesTodayAmount { get; set; }
    public int PurchasesTodayCount { get; set; }
    public decimal PurchasesTodayAmount { get; set; }
    public DateTime PeriodDateFrom { get; set; }
    public DateTime PeriodDateTo { get; set; }
    public int SalesInPeriodCount { get; set; }
    public decimal PeriodRevenue { get; set; }
    public decimal EstimatedProfit { get; set; }
    public int LowStockProductsCount { get; set; }
    public List<ProductResponseDto> LowStockProducts { get; set; } = [];
}
