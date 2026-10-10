using DistribuidoraAPI.DTOs.Reports;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("admin")]
    public async Task<ActionResult<AdminDashboardResponseDto>> GetAdminDashboard([FromQuery] int userId, [FromQuery] DateTime? dateFrom, [FromQuery] DateTime? dateTo)
    {
        try
        {
            var dashboard = await _dashboardService.GetAdminDashboard(userId,dateFrom, dateTo);
            return Ok(dashboard);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
