using DistribuidoraAPI.DTOs.Vendor;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;
using System.Net.Mail;

namespace DistribuidoraAPI.Services.Implementations;

public class VendorService : IVendorService
{
    private const int NameMaxLength = 150;
    private const int PhoneMaxLength = 30;
    private const int EmailMaxLength = 150;
    private const int AddressMaxLength = 250;
    private const int CityMaxLength = 100;
    private const int ObservationsMaxLength = 1500;

    private readonly IUnitOfWork _unitOfWork;

    public VendorService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<VendorResponseDto>> GetAll()
    {
        var vendors = await _unitOfWork.Vendors.GetActiveVendors();
        return vendors.Select(Map).ToList();
    }

    public async Task<VendorResponseDto> GetById(int id)
    {
        var vendor = await _unitOfWork.Vendors.GetActiveVendorById(id);

        if (vendor is null)
            throw new KeyNotFoundException($"No se encontró el proveedor con ID {id}");

        return Map(vendor);
    }

    public async Task<VendorResponseDto> Create(CreateVendorRequest request)
    {
        var data = NormalizeAndValidate(request);

        var vendor = new Vendor
        {
            Name = data.Name,
            Phone = data.Phone,
            Email = data.Email,
            Address = data.Address,
            City = data.City,
            Observations = data.Observations,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.Vendors.Add(vendor);
        await _unitOfWork.SaveChanges();

        return Map(vendor);
    }

    public async Task<VendorResponseDto> Update(int id, UpdateVendorRequest request)
    {
        var data = NormalizeAndValidate(request);
        var vendor = await _unitOfWork.Vendors.GetActiveVendorById(id);

        if (vendor is null)
            throw new KeyNotFoundException($"No se encontró el proveedor con ID {id}");

        vendor.Name = data.Name;
        vendor.Phone = data.Phone;
        vendor.Email = data.Email;
        vendor.Address = data.Address;
        vendor.City = data.City;
        vendor.Observations = data.Observations;
        vendor.ModifiedAt = DateTime.UtcNow;
        vendor.ModifiedBy = request.UserId;

        _unitOfWork.Vendors.Update(vendor);
        await _unitOfWork.SaveChanges();

        return Map(vendor);
    }

    public async Task Delete(int id, int userId)
    {
        var vendor = await _unitOfWork.Vendors.GetActiveVendorById(id);

        if (vendor is null)
            throw new KeyNotFoundException($"No se encontró el proveedor con ID {id}");

        vendor.Active = false;
        vendor.ModifiedAt = DateTime.UtcNow;
        vendor.ModifiedBy = userId;

        _unitOfWork.Vendors.Update(vendor);
        await _unitOfWork.SaveChanges();
    }

    private static VendorResponseDto Map(Vendor vendor)
    {
        return new VendorResponseDto
        {
            Id = vendor.Id,
            Name = vendor.Name,
            Phone = vendor.Phone,
            Email = vendor.Email,
            Address = vendor.Address,
            City = vendor.City,
            Observations = vendor.Observations,
            Active = vendor.Active,
            CreatedAt = vendor.CreatedAt,
            CreatedBy = vendor.CreatedBy,
            ModifiedAt = vendor.ModifiedAt,
            ModifiedBy = vendor.ModifiedBy
        };
    }

    private static VendorData NormalizeAndValidate(CreateVendorRequest request)
    {
        return NormalizeAndValidate(
            request.Name,
            request.Phone,
            request.Email,
            request.Address,
            request.City,
            request.Observations);
    }

    private static VendorData NormalizeAndValidate(UpdateVendorRequest request)
    {
        return NormalizeAndValidate(
            request.Name,
            request.Phone,
            request.Email,
            request.Address,
            request.City,
            request.Observations);
    }

    private static VendorData NormalizeAndValidate(
        string name,
        string? phone,
        string? email,
        string? address,
        string? city,
        string? observations)
    {
        name = name?.Trim() ?? string.Empty;
        phone = NormalizeOptional(phone);
        email = NormalizeOptional(email);
        address = NormalizeOptional(address);
        city = NormalizeOptional(city);
        observations = NormalizeOptional(observations);

        ValidateRequired(name, "El nombre del proveedor", NameMaxLength);
        ValidateMaxLength(phone, "El teléfono", PhoneMaxLength);
        ValidateMaxLength(email, "El email", EmailMaxLength);
        ValidateMaxLength(address, "La dirección", AddressMaxLength);
        ValidateMaxLength(city, "La localidad", CityMaxLength);
        ValidateMaxLength(observations, "Las observaciones", ObservationsMaxLength);

        if (email is not null && !IsValidEmail(email))
            throw new ArgumentException("El email del proveedor no es válido");

        return new VendorData(name, phone, email, address, city, observations);
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

    private static bool IsValidEmail(string email)
    {
        try
        {
            var address = new MailAddress(email);
            return address.Address.Equals(email, StringComparison.OrdinalIgnoreCase);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private sealed record VendorData(string Name, string? Phone, string? Email, string? Address, string? City, string? Observations);
}
