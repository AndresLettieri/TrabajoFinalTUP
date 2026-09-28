using DistribuidoraAPI.DTOs.Brand;

namespace DistribuidoraAPI.Services;

public interface IBrandService
{
    Task<IEnumerable<BrandResponseDto>> GetAll();
    Task<BrandResponseDto?> GetById(int id);
    Task<BrandResponseDto> Create(CreateBrandRequest request);
    Task<BrandResponseDto> Update(int id, UpdateBrandRequest request);
    Task Delete(int id, int userId);
}
