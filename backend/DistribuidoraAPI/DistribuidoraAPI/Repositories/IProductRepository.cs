using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IProductRepository : IRepository<Product>
{
    Task<bool> ExistsByCode(string code, int? excludedProductId = null);
    Task<bool> ExistsByBarcode(string barcode, int? excludedProductId = null);
    Task<IEnumerable<Product>> GetActiveProducts();
    Task<Product?> GetActiveProductById(int id);
}
