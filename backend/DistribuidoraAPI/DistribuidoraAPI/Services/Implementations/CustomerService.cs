using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Customer;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;
using System.Net.Mail;

namespace DistribuidoraAPI.Services.Implementations;

public class CustomerService : ICustomerService
{
    private const int NameMaxLength = 150;
    private const int DocumentMaxLength = 30;
    private const int PhoneMaxLength = 30;
    private const int EmailMaxLength = 150;
    private const int AddressMaxLength = 250;
    private const int CityMaxLength = 100;
    private const int ObservationsMaxLength = 1500;

    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<CustomerResponseDto>> GetAll()
    {
        var customers = await _unitOfWork.Customers.GetActiveCustomers();
        return customers.Select(Map).ToList();
    }

    public async Task<PagedResultDto<CustomerResponseDto>> GetByFilter(CustomerFilterDto filter)
    {
        var customers = await _unitOfWork.Customers.GetFilteredCustomers(filter);
        
        return new PagedResultDto<CustomerResponseDto>
        {
            Items = customers.Items.Select(Map).ToList(),
            TotalItems = customers.TotalItems,
            Page = customers.Page,
            PageSize = customers.PageSize,
            TotalPages = customers.TotalPages
        };
    }

    public async Task<CustomerResponseDto> GetById(int id)
    {
        var customer = await _unitOfWork.Customers.GetActiveCustomerById(id);

        if (customer is null)
            throw new KeyNotFoundException($"No se encontró el cliente con ID {id}");

        return Map(customer);
    }

    public async Task<CustomerResponseDto> Create(CreateCustomerRequest request)
    {
        var data = NormalizeAndValidate(request);

        if (await _unitOfWork.Customers.ExistsByDocument(data.Document))
        {
            throw new InvalidOperationException(
                $"Ya existe un cliente con el documento '{data.Document}'");
        }

        var customer = new Customer
        {
            Name = data.Name,
            Document = data.Document,
            Phone = data.Phone,
            Email = data.Email,
            Address = data.Address,
            City = data.City,
            Observations = data.Observations,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.Customers.Add(customer);
        await _unitOfWork.SaveChanges();

        return Map(customer);
    }

    public async Task<CustomerResponseDto> Update(int id, UpdateCustomerRequest request)
    {
        var data = NormalizeAndValidate(request);
        var customer = await _unitOfWork.Customers.GetActiveCustomerById(id);

        if (customer is null)
            throw new KeyNotFoundException($"No se encontró el cliente con ID {id}");

        var documentChanged = !customer.Document.Equals(
            data.Document,
            StringComparison.OrdinalIgnoreCase);

        if (documentChanged && await _unitOfWork.Customers.ExistsByDocument(data.Document))
        {
            throw new InvalidOperationException(
                $"Ya existe un cliente con el documento '{data.Document}'");
        }

        customer.Name = data.Name;
        customer.Document = data.Document;
        customer.Phone = data.Phone;
        customer.Email = data.Email;
        customer.Address = data.Address;
        customer.City = data.City;
        customer.Observations = data.Observations;
        customer.ModifiedAt = DateTime.UtcNow;
        customer.ModifiedBy = request.UserId;

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChanges();

        return Map(customer);
    }

    public async Task Delete(int id, int userId)
    {
        var customer = await _unitOfWork.Customers.GetActiveCustomerById(id);

        if (customer is null)
            throw new KeyNotFoundException($"No se encontró el cliente con ID {id}");

        customer.Active = false;
        customer.ModifiedAt = DateTime.UtcNow;
        customer.ModifiedBy = userId;

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.SaveChanges();
    }

    private static CustomerResponseDto Map(Customer customer)
    {
        return new CustomerResponseDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Document = customer.Document,
            Phone = customer.Phone,
            Email = customer.Email,
            Address = customer.Address,
            City = customer.City,
            Observations = customer.Observations,
            Active = customer.Active,
            CreatedAt = customer.CreatedAt,
            CreatedBy = customer.CreatedBy,
            ModifiedAt = customer.ModifiedAt,
            ModifiedBy = customer.ModifiedBy
        };
    }

    private static CustomerData NormalizeAndValidate(CreateCustomerRequest request)
    {
        return NormalizeAndValidate(
            request.Name,
            request.Document,
            request.Phone,
            request.Email,
            request.Address,
            request.City,
            request.Observations);
    }

    private static CustomerData NormalizeAndValidate(UpdateCustomerRequest request)
    {
        return NormalizeAndValidate(
            request.Name,
            request.Document,
            request.Phone,
            request.Email,
            request.Address,
            request.City,
            request.Observations);
    }

    private static CustomerData NormalizeAndValidate(string name, string document, string? phone, string? email, string? address, string? city, string? observations)
    {
        name = name?.Trim() ?? string.Empty;
        document = document?.Trim() ?? string.Empty;
        phone = NormalizeOptional(phone);
        email = NormalizeOptional(email);
        address = NormalizeOptional(address);
        city = NormalizeOptional(city);
        observations = NormalizeOptional(observations);

        ValidateRequired(name, "El nombre del cliente", NameMaxLength);
        ValidateRequired(document, "El documento del cliente", DocumentMaxLength);
        ValidateMaxLength(phone, "El teléfono", PhoneMaxLength);
        ValidateMaxLength(email, "El email", EmailMaxLength);
        ValidateMaxLength(address, "La dirección", AddressMaxLength);
        ValidateMaxLength(city, "La localidad", CityMaxLength);
        ValidateMaxLength(observations, "Las observaciones", ObservationsMaxLength);

        if (email is not null && !IsValidEmail(email))
            throw new ArgumentException("El email del cliente no es válido");

        return new CustomerData(name, document, phone, email, address, city, observations);
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

    private sealed record CustomerData(string Name, string Document, string? Phone, string? Email, string? Address, string? City, string? Observations);
}
