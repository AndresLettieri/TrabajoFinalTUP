using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.Services.Implementations;

public class DashboardService : IDashboardService
{
    private readonly IOrderService _orderService;
    private readonly IPurchaseService _purchaseService;
    private readonly IProductService _productService;
    private readonly IUserService _userService;

    public DashboardService(IOrderService orderService, IPurchaseService purchaseService, IProductService productService, IUserService userService)
    {
        _orderService = orderService;
        _purchaseService = purchaseService;
        _productService = productService;
        _userService = userService;
    }

    public async Task<AdminDashboardResponseDto> GetAdminDashboard(int userId, DateTime? dateFrom, DateTime? dateTo)
    {
        var usuario = await _userService.GetById(userId);
        if (usuario == null)
            throw new ArgumentException("Usuario no encontrado");

        if (usuario.Role != Role.Admin)
            throw new UnauthorizedAccessException("El usuario no tiene permisos de administrador");

        if(usuario.Active == false)
            throw new UnauthorizedAccessException("El usuario no está activo");

        if (dateFrom.HasValue != dateTo.HasValue)
            throw new ArgumentException("Debe indicar ambas fechas del período o ninguna");

        var today = DateTime.Today;
        var startDate = dateFrom?.Date ?? new DateTime(today.Year, today.Month, 1);
        var endDate = dateTo?.Date ?? today;
        if (startDate > endDate)
            throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta");

        var salesToday = await _orderService.GetSalesReport(today, today);
        var purchasesToday = await _purchaseService.GetPurchaseReport(today, today);
        var salesInPeriod = await _orderService.GetSalesReport(startDate, endDate);
        var profitInPeriod = await _orderService.GetProfitReport(startDate, endDate);
        var lowStockProducts = (await _productService.GetStockAlerts()).ToList();

        return new AdminDashboardResponseDto
        {
            Today = today,
            SalesTodayCount = salesToday.SalesCount,
            SalesTodayAmount = salesToday.TotalAmount,
            PurchasesTodayCount = purchasesToday.PurchaseCount,
            PurchasesTodayAmount = purchasesToday.TotalAmount,
            PeriodDateFrom = startDate,
            PeriodDateTo = endDate,
            SalesInPeriodCount = salesInPeriod.SalesCount,
            PeriodRevenue = salesInPeriod.TotalAmount,
            EstimatedProfit = profitInPeriod.TotalProfit,
            LowStockProductsCount = lowStockProducts.Count,
            LowStockProducts = lowStockProducts
        };
    }
}
