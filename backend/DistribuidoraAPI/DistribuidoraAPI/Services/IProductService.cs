using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Product;

namespace DistribuidoraAPI.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAll();
    Task<IEnumerable<ProductResponseDto>> GetStockAlerts();
    Task<ProductResponseDto?> GetById(int id);
    Task<ProductResponseDto> Create(CreateProductRequest request);
    Task<ProductResponseDto> Update(int id, UpdateProductRequest request);
    Task Delete(int id, int userId);
    Task<PagedResultDto<ProductResponseDto>> GetByFilter(ProductFilterDto filter);
    Task Activate(int id, int userId);
}
