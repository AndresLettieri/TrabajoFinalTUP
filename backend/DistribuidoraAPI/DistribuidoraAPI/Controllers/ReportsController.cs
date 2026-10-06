using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IPurchaseService _purchaseService;

    public ReportsController(IOrderService orderService, IPurchaseService purchaseService)
    {
        _orderService = orderService;
        _purchaseService = purchaseService;
    }

    [HttpGet("sales")]
    public async Task<ActionResult<SalesReportResponseDto>> GetSalesByPeriod([FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        try
        {
            var report = await _orderService.GetSalesReport(dateFrom, dateTo);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sales/by-customer")]
    public async Task<ActionResult<SalesReportResponseDto>> GetSalesByCustomer([FromQuery] int customerId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        try
        {
            var report = await _orderService.GetSalesReport(dateFrom, dateTo, customerId: customerId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("sales/by-seller")]
    public async Task<ActionResult<SalesReportResponseDto>> GetSalesBySeller([FromQuery] int sellerId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        try
        {
            var report = await _orderService.GetSalesReport(dateFrom, dateTo, sellerId: sellerId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("profit")]
    public async Task<ActionResult<ProfitReportResponseDto>> GetProfitByPeriod([FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        try
        {
            var report = await _orderService.GetProfitReport(dateFrom, dateTo);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("purchases")]
    public async Task<ActionResult<PurchaseReportResponseDto>> GetPurchasesByPeriod([FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo, [FromQuery] int? vendorId)
    {
        try
        {
            var report = await _purchaseService.GetPurchaseReport(dateFrom, dateTo, vendorId);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
