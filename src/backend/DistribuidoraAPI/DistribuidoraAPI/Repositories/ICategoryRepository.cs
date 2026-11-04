using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Category;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<Category?> GetByName(string name);
    Task<bool> ExistsByName(string name);
    Task<IEnumerable<Category>> GetActiveCategories();
    Task<Category?> GetActiveCategoryById(int id);
    Task<PagedResultDto<Category>> GetFilteredCategories(CategoryFilterDto filter);

}
