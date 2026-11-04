using DistribuidoraAPI.DTOs.PaymentMethod;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;

namespace DistribuidoraAPI.Services.Implementations;

public class PaymentMethodService : IPaymentMethodService
{
    private const int NameMaxLength = 50;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<PaymentMethodService> _logger;

    public PaymentMethodService(IUnitOfWork unitOfWork, ILogger<PaymentMethodService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<PaymentMethodResponseDto>> GetAll()
    {
        _logger.LogInformation("Obteniendo todos los medios de pago activos");

        var paymentMethods = await _unitOfWork.PaymentMethods.GetActivePaymentMethods();

        return paymentMethods.Select(Map).ToList();
    }

    public async Task<PaymentMethodResponseDto?> GetById(int id)
    {
        var paymentMethod = await _unitOfWork.PaymentMethods.GetActivePaymentMethodById(id);

        return paymentMethod is null ? null : Map(paymentMethod);
    }

    public async Task<PaymentMethodResponseDto> Create(CreatePaymentMethodRequest request)
    {
        var name = NormalizeAndValidateName(request.Name);

        if (await _unitOfWork.PaymentMethods.ExistsByName(name))
        {
            throw new InvalidOperationException(
                $"Ya existe un medio de pago con el nombre '{name}'");
        }

        var paymentMethod = new PaymentMethod
        {
            Name = name,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _unitOfWork.PaymentMethods.Add(paymentMethod);
        await _unitOfWork.SaveChanges();

        return Map(paymentMethod);
    }

    public async Task<PaymentMethodResponseDto> Update(int id, UpdatePaymentMethodRequest request)
    {
        var name = NormalizeAndValidateName(request.Name);
        var paymentMethod = await _unitOfWork.PaymentMethods.GetActivePaymentMethodById(id);

        if (paymentMethod is null)
            throw new KeyNotFoundException($"No se encontró el medio de pago con ID {id}");

        if (!paymentMethod.Name.Equals(name, StringComparison.OrdinalIgnoreCase)
            && await _unitOfWork.PaymentMethods.ExistsByName(name))
        {
            throw new InvalidOperationException(
                $"Ya existe un medio de pago con el nombre '{name}'");
        }

        paymentMethod.Name = name;
        paymentMethod.ModifiedAt = DateTime.UtcNow;
        paymentMethod.ModifiedBy = request.UserId;

        _unitOfWork.PaymentMethods.Update(paymentMethod);
        await _unitOfWork.SaveChanges();

        return Map(paymentMethod);
    }

    public async Task Delete(int id, int userId)
    {
        var paymentMethod = await _unitOfWork.PaymentMethods.GetActivePaymentMethodById(id);

        if (paymentMethod is null)
            throw new KeyNotFoundException($"No se encontró el medio de pago con ID {id}");

        paymentMethod.Active = false;
        paymentMethod.ModifiedAt = DateTime.UtcNow;
        paymentMethod.ModifiedBy = userId;

        _unitOfWork.PaymentMethods.Update(paymentMethod);
        await _unitOfWork.SaveChanges();
    }

    private static PaymentMethodResponseDto Map(PaymentMethod paymentMethod)
    {
        return new PaymentMethodResponseDto
        {
            Id = paymentMethod.Id,
            Name = paymentMethod.Name
        };
    }

    private static string NormalizeAndValidateName(string? name)
    {
        name = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("El nombre del medio de pago no puede estar vacío");

        if (name.Length > NameMaxLength)
        {
            throw new ArgumentException(
                $"El nombre del medio de pago no puede superar los {NameMaxLength} caracteres");
        }

        return name;
    }
}
