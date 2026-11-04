using DistribuidoraAPI.DTOs.PaymentMethod;

namespace DistribuidoraAPI.Services;

public interface IPaymentMethodService
{
    Task<IEnumerable<PaymentMethodResponseDto>> GetAll();
    Task<PaymentMethodResponseDto?> GetById(int id);
    Task<PaymentMethodResponseDto> Create(CreatePaymentMethodRequest request);
    Task<PaymentMethodResponseDto> Update(int id, UpdatePaymentMethodRequest request);
    Task Delete(int id, int userId);
}
