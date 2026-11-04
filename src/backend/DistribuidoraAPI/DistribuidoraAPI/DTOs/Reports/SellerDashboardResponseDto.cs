using DistribuidoraAPI.DTOs.Product;

namespace DistribuidoraAPI.DTOs.Reports
{
    public class SellerDashboardResponseDto
    {
        public DateTime Today { get; set; }
        public int SalesTodayCount { get; set; }
        public decimal SalesTodayAmount { get; set; }
        public int CustomersTodayCount { get; set; }
        public DateTime PeriodDateFrom { get; set; }
        public DateTime PeriodDateTo { get; set; }
        public int SalesInPeriodCount { get; set; }
    }
}
