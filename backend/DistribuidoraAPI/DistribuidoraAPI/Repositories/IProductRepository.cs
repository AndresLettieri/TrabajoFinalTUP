using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<bool> ExistsByCode(string code, int? excludedProductId = null);
    Task<bool> ExistsByBarcode(string barcode, int? excludedProductId = null);
    Task<IEnumerable<Product>> Search(string? code, string? barcode, string? description, int? categoryId, int? brandId, bool? active = true);
    Task<IEnumerable<Product>> GetActiveProducts();
    Task<Product?> GetActiveProductById(int id);
}
