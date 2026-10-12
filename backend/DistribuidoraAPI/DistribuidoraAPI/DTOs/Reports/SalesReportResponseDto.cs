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

public class TopProductDto
{
    public string ProductCode { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalProfit { get; set; }
}

public class TopCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalProfit { get; set; }
}

