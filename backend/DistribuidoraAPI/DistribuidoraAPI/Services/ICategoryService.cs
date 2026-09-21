using DistribuidoraAPI.DTOs.Category;

namespace DistribuidoraAPI.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetAll();
    Task<CategoryResponseDto?> GetById(int id);
    Task<CategoryResponseDto> Create(CreateCategoryRequest request);
    Task<CategoryResponseDto> Update(int id, UpdateCategoryRequest request);
    Task Delete(int id, int userId);
}
