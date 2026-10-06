using DistribuidoraAPI.DTOs.Reports;

namespace DistribuidoraAPI.Services;

public interface IDashboardService
{
    Task<AdminDashboardResponseDto> GetAdminDashboard(DateTime? dateFrom, DateTime? dateTo);
}
