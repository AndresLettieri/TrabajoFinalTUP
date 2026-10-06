namespace DistribuidoraAPI.DTOs.Reports;

public class ProfitReportResponseDto
{
    public DateTime DateFrom { get; set; }
    public DateTime DateTo { get; set; }
    public int SalesCount { get; set; }
    public decimal TotalProfit { get; set; }
    public List<ProfitReportSaleDto> Sales { get; set; } = [];
}

public class ProfitReportSaleDto
{
    public int Id { get; set; }
    public int Number { get; set; }
    public DateTime Date { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string SellerName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal Profit { get; set; }
    public List<ProfitReportDetailDto> Details { get; set; } = [];
}

public class ProfitReportDetailDto
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal SalePrice { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Profit { get; set; }
}
