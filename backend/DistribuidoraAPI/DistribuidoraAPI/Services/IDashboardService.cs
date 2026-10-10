using DistribuidoraAPI.DTOs.Reports;

namespace DistribuidoraAPI.Services;

public interface IDashboardService
{
    Task<AdminDashboardResponseDto> GetAdminDashboard(int userId, DateTime? dateFrom, DateTime? dateTo);
}
