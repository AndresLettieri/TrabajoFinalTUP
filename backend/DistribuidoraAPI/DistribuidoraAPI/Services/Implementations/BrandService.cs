using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Brand;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class BrandService : IBrandService
{
    private const int NameMaxLength = 100;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BrandService> _logger;

    public BrandService(IUnitOfWork unitOfWork, ILogger<BrandService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<BrandResponseDto>> GetAll()
    {
        _logger.LogInformation("Obteniendo todas las marcas activas");

        var brands = await _unitOfWork.Brands.GetActiveBrands();

        return brands.Select(Map).ToList();
    }

    public async Task<PagedResultDto<BrandResponseDto>> GetByFilter(BrandFilterDto filter)
    {
        var brands = await _unitOfWork.Brands.GetFilteredBrands(filter);

        return new PagedResultDto<BrandResponseDto>
        {
            Items = brands.Items.Select(Map).ToList(),
            TotalItems = brands.TotalItems,
            Page = brands.Page,
            PageSize = brands.PageSize,
            TotalPages = brands.TotalPages
        };
    }


    public async Task<BrandResponseDto?> GetById(int id)
    {
        var brand = await _unitOfWork.Brands.GetActiveBrandById(id);

        return brand is null ? null : Map(brand);
    }

    public async Task<BrandResponseDto> Create(CreateBrandRequest request)
    {
        var name = NormalizeAndValidateName(request.Name);

        if (await _unitOfWork.Brands.ExistsByName(name))
        {
            throw new InvalidOperationException(
                $"Ya existe una marca con el nombre '{name}'");
        }

        var brand = new Brand
        {
            Name = name,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.Brands.Add(brand);
        await _unitOfWork.SaveChanges();

        return Map(brand);
    }

    public async Task<BrandResponseDto> Update(int id, UpdateBrandRequest request)
    {
        var name = NormalizeAndValidateName(request.Name);
        var brand = await _unitOfWork.Brands.GetActiveBrandById(id);

        if (brand is null)
            throw new KeyNotFoundException($"No se encontró la marca con ID {id}");

        if (!brand.Name.Equals(name, StringComparison.OrdinalIgnoreCase)
            && await _unitOfWork.Brands.ExistsByName(name))
        {
            throw new InvalidOperationException(
                $"Ya existe una marca con el nombre '{name}'");
        }

        brand.Name = name;
        brand.ModifiedAt = DateTime.UtcNow;
        brand.ModifiedBy = request.UserId;

        _unitOfWork.Brands.Update(brand);
        await _unitOfWork.SaveChanges();

        return Map(brand);
    }

    public async Task Delete(int id, int userId)
    {
        var brand = await _unitOfWork.Brands.GetActiveBrandById(id);

        if (brand is null)
            throw new KeyNotFoundException($"No se encontró la marca con ID {id}");

        brand.Active = false;
        brand.ModifiedAt = DateTime.UtcNow;
        brand.ModifiedBy = userId;

        _unitOfWork.Brands.Update(brand);
        await _unitOfWork.SaveChanges();
    }

    private static BrandResponseDto Map(Brand brand)
    {
        return new BrandResponseDto
        {
            Id = brand.Id,
            Name = brand.Name,
            Active = brand.Active
        };
    }

    private static string NormalizeAndValidateName(string? name)
    {
        name = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("El nombre de la marca no puede estar vacío");

        if (name.Length > NameMaxLength)
        {
            throw new ArgumentException(
                $"El nombre de la marca no puede superar los {NameMaxLength} caracteres");
        }

        return name;
    }

    public async Task Activate(int id, int userId)
    {
        var brand = await _unitOfWork.Brands.GetByIdAsync(id);

        if (brand == null)
            throw new KeyNotFoundException($"No se encontró la marca con ID {id}");


        brand.Active = true;
        brand.ModifiedAt = DateTime.UtcNow;
        brand.ModifiedBy = userId;

        _unitOfWork.Brands.Update(brand);
        await _unitOfWork.SaveChanges();
    }
}
