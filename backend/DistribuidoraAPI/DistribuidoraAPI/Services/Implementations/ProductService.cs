using DistribuidoraAPI.DTOs.Product;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class ProductService : IProductService
{
    private const int CodeMaxLength = 30;
    private const int BarcodeMaxLength = 30;
    private const int DescriptionMaxLength = 200;
    private const decimal MaxPrice = 9_999_999_999.99m;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IUnitOfWork unitOfWork, ILogger<ProductService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAll(ProductFilterRequest? filters = null)
    {
        var normalizedFilters = NormalizeFilters(filters);

        _logger.LogInformation(
            "Buscando productos con filtros: Code={Code}, Barcode={Barcode}, Description={Description}, CategoryId={CategoryId}, BrandId={BrandId}, Active={Active}",
            normalizedFilters.Code,
            normalizedFilters.Barcode,
            normalizedFilters.Description,
            normalizedFilters.CategoryId,
            normalizedFilters.BrandId,
            normalizedFilters.Active);

        var products = await _unitOfWork.Products.Search(
            normalizedFilters.Code,
            normalizedFilters.Barcode,
            normalizedFilters.Description,
            normalizedFilters.CategoryId,
            normalizedFilters.BrandId,
            normalizedFilters.Active);

        return products.Select(Map).ToList();
    }

    public async Task<ProductResponseDto?> GetById(int id)
    {
        var product = await _unitOfWork.Products.GetActiveProductById(id);

        return product is null ? null : Map(product);
    }

    public async Task<ProductResponseDto> Create(CreateProductRequest request)
    {
        var data = NormalizeAndValidate(request);
        await ValidateReferences(data.CategoryId, data.BrandId);
        await ValidateUniqueFields(data.Code, data.Barcode);

        var product = new Product
        {
            Code = data.Code,
            Barcode = data.Barcode,
            Description = data.Description,
            CategoryId = data.CategoryId,
            BrandId = data.BrandId,
            PurchasePrice = data.PurchasePrice,
            SalePrice = data.SalePrice,
            Stock = 0,
            MinimumStock = data.MinimumStock,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.Products.Add(product);
        await _unitOfWork.SaveChanges();

        return Map(product);
    }

    public async Task<ProductResponseDto> Update(int id, UpdateProductRequest request)
    {
        var data = NormalizeAndValidate(request);
        var product = await _unitOfWork.Products.GetActiveProductById(id);

        if (product is null)
            throw new KeyNotFoundException($"No se encontró el producto con ID {id}");

        await ValidateReferences(data.CategoryId, data.BrandId);
        await ValidateUniqueFields(data.Code, data.Barcode, id);

        product.Code = data.Code;
        product.Barcode = data.Barcode;
        product.Description = data.Description;
        product.CategoryId = data.CategoryId;
        product.BrandId = data.BrandId;
        product.PurchasePrice = data.PurchasePrice;
        product.SalePrice = data.SalePrice;
        product.MinimumStock = data.MinimumStock;
        product.ModifiedAt = DateTime.UtcNow;
        product.ModifiedBy = request.UserId;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChanges();

        return Map(product);
    }

    public async Task Delete(int id, int userId)
    {
        var product = await _unitOfWork.Products.GetActiveProductById(id);

        if (product is null)
            throw new KeyNotFoundException($"No se encontró el producto con ID {id}");

        product.Active = false;
        product.ModifiedAt = DateTime.UtcNow;
        product.ModifiedBy = userId;

        _unitOfWork.Products.Update(product);
        await _unitOfWork.SaveChanges();
    }

    private async Task ValidateReferences(int categoryId, int brandId)
    {
        if (categoryId <= 0)
            throw new ArgumentException("La categoría del producto es obligatoria");

        if (brandId <= 0)
            throw new ArgumentException("La marca del producto es obligatoria");

        var category = await _unitOfWork.Categories.GetActiveCategoryById(categoryId);
        if (category is null)
            throw new KeyNotFoundException(
                $"No se encontró una categoría activa con ID {categoryId}");

        var brand = await _unitOfWork.Brands.GetActiveBrandById(brandId);
        if (brand is null)
            throw new KeyNotFoundException(
                $"No se encontró una marca activa con ID {brandId}");
    }

    private async Task ValidateUniqueFields(string code, string? barcode, int? excludedProductId = null)
    {
        if (await _unitOfWork.Products.ExistsByCode(code, excludedProductId))
        {
            throw new InvalidOperationException(
                $"Ya existe un producto con el código '{code}'");
        }

        if (barcode is not null
            && await _unitOfWork.Products.ExistsByBarcode(barcode, excludedProductId))
        {
            throw new InvalidOperationException(
                $"Ya existe un producto con el código de barras '{barcode}'");
        }
    }

    private static ProductResponseDto Map(Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Code = product.Code,
            Barcode = product.Barcode,
            Description = product.Description,
            CategoryId = product.CategoryId,
            BrandId = product.BrandId,
            PurchasePrice = product.PurchasePrice,
            SalePrice = product.SalePrice,
            Stock = product.Stock,
            MinimumStock = product.MinimumStock,
            Active = product.Active,
            CreatedAt = product.CreatedAt,
            CreatedBy = product.CreatedBy,
            ModifiedAt = product.ModifiedAt,
            ModifiedBy = product.ModifiedBy
        };
    }

    private static ProductFilterData NormalizeFilters(ProductFilterRequest? filters)
    {
        var code = NormalizeOptional(filters?.Code);
        var barcode = NormalizeOptional(filters?.Barcode);
        var description = NormalizeOptional(filters?.Description);
        var categoryId = filters?.CategoryId;
        var brandId = filters?.BrandId;

        if (categoryId.HasValue && categoryId.Value <= 0)
            throw new ArgumentException("El filtro de categoría debe ser mayor que cero");

        if (brandId.HasValue && brandId.Value <= 0)
            throw new ArgumentException("El filtro de marca debe ser mayor que cero");

        return new ProductFilterData(
            code,
            barcode,
            description,
            categoryId,
            brandId,
            filters?.Active ?? true);
    }

    private static ProductData NormalizeAndValidate(CreateProductRequest request)
    {
        return NormalizeAndValidate(
            request.Code,
            request.Barcode,
            request.Description,
            request.CategoryId,
            request.BrandId,
            request.PurchasePrice,
            request.SalePrice,
            request.MinimumStock);
    }

    private static ProductData NormalizeAndValidate(UpdateProductRequest request)
    {
        return NormalizeAndValidate(
            request.Code,
            request.Barcode,
            request.Description,
            request.CategoryId,
            request.BrandId,
            request.PurchasePrice,
            request.SalePrice,
            request.MinimumStock);
    }

    private static ProductData NormalizeAndValidate(
        string? code,
        string? barcode,
        string? description,
        int categoryId,
        int brandId,
        decimal purchasePrice,
        decimal salePrice,
        int minimumStock)
    {
        code = code?.Trim() ?? string.Empty;
        barcode = NormalizeOptional(barcode);
        description = description?.Trim() ?? string.Empty;

        ValidateRequired(code, "El código del producto", CodeMaxLength);
        ValidateMaxLength(barcode, "El código de barras", BarcodeMaxLength);
        ValidateRequired(description, "La descripción del producto", DescriptionMaxLength);
        ValidatePrice(purchasePrice, "El precio de compra");
        ValidatePrice(salePrice, "El precio de venta");

        if (categoryId <= 0)
            throw new ArgumentException("La categoría del producto es obligatoria");

        if (brandId <= 0)
            throw new ArgumentException("La marca del producto es obligatoria");

        if (minimumStock < 0)
            throw new ArgumentException("El stock mínimo no puede ser negativo");

        return new ProductData(
            code,
            barcode,
            description,
            categoryId,
            brandId,
            purchasePrice,
            salePrice,
            minimumStock);
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static void ValidateRequired(string value, string fieldName, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{fieldName} no puede estar vacío");

        ValidateMaxLength(value, fieldName, maxLength);
    }

    private static void ValidateMaxLength(string? value, string fieldName, int maxLength)
    {
        if (value is not null && value.Length > maxLength)
        {
            throw new ArgumentException(
                $"{fieldName} no puede superar los {maxLength} caracteres");
        }
    }

    private static void ValidatePrice(decimal value, string fieldName)
    {
        if (value < 0)
            throw new ArgumentException($"{fieldName} no puede ser negativo");

        if (value > MaxPrice)
        {
            throw new ArgumentException(
                $"{fieldName} no puede superar los {MaxPrice:0.00}");
        }

        if (decimal.Round(value, 2) != value)
            throw new ArgumentException($"{fieldName} no puede tener más de 2 decimales");
    }

    private sealed record ProductData(string Code, string? Barcode, string Description, int CategoryId, int BrandId, decimal PurchasePrice, decimal SalePrice, int MinimumStock);

    private sealed record ProductFilterData(
        string? Code,
        string? Barcode,
        string? Description,
        int? CategoryId,
        int? BrandId,
        bool Active);
}
