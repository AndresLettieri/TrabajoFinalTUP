using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<Category?> GetByName(string name);
    Task<bool> ExistsByName(string name);
    Task<IEnumerable<Category>> GetActiveCategories();
    Task<Category?> GetActiveCategoryById(int id);
}
