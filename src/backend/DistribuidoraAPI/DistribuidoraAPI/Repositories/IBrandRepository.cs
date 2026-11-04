using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Brand;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IBrandRepository : IRepository<Brand>
{
    Task<Brand?> GetByName(string name);
    Task<bool> ExistsByName(string name);
    Task<IEnumerable<Brand>> GetActiveBrands();
    Task<Brand?> GetActiveBrandById(int id);
    Task<PagedResultDto<Brand>> GetFilteredBrands(BrandFilterDto filter);
}
