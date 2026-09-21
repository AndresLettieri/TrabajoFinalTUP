using DistribuidoraAPI.DTOs.Category;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(IUnitOfWork unitOfWork, ILogger<CategoryService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAll()
    {
        _logger.LogInformation("Obteniendo todas las categorías activas");

        var categories = await _unitOfWork.Categories.GetActiveCategories();

        return categories.Select(c => new CategoryResponseDto
        {
            Id = c.Id,
            Name = c.Name
        }).ToList();
    }
    public async Task<CategoryResponseDto?> GetById(int id)
    {
        
        var category = await _unitOfWork.Categories.GetActiveCategoryById(id);

        if (category is null)
            return null;
        
        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }
    public async Task<CategoryResponseDto> Create(CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("El nombre de la categoría no puede estar vacío");
    
        var existingCategory = await _unitOfWork.Categories.ExistsByName(request.Name);
        if (existingCategory)
        {
            throw new InvalidOperationException($"Ya existe una categoría con el nombre '{request.Name}'");
        }

        var category = new Category
        {
            Name = request.Name.Trim(),
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.Categories.Add(category);
        await _unitOfWork.SaveChanges();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }
    public async Task<CategoryResponseDto> Update(int id, UpdateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("El nombre de la categoría no puede estar vacío");
        }

        var category = await _unitOfWork.Categories.GetActiveCategoryById(id);
        if (category is null)
        {
            throw new KeyNotFoundException($"No se encontró la categoría con ID {id}");
        }

        if (!category.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var isDuplicate = await _unitOfWork.Categories.ExistsByName(request.Name);
            if (isDuplicate)
            {
                throw new InvalidOperationException($"Ya existe una categoría con el nombre '{request.Name}'");
            }
        }

        category.Name = request.Name.Trim();
        category.ModifiedAt = DateTime.UtcNow;
        category.ModifiedBy = request.UserId;

        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChanges();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task Delete(int id, int userId)
    {
        var category = await _unitOfWork.Categories.GetActiveCategoryById(id);
        if (category is null)
            throw new KeyNotFoundException($"No se encontró la categoría con ID {id}");
        

        category.Active = false;
        category.ModifiedAt = DateTime.UtcNow;
        category.ModifiedBy = userId;

        _unitOfWork.Categories.Update(category);
        await _unitOfWork.SaveChanges();
    }
}
