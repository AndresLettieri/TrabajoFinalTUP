using DistribuidoraAPI.DTOs.Customer;
using DistribuidoraAPI.DTOs;

namespace DistribuidoraAPI.Services;

public interface ICustomerService
{
    Task<IEnumerable<CustomerResponseDto>> GetAll();
    Task<CustomerResponseDto> GetById(int id);
    Task<CustomerResponseDto> Create(CreateCustomerRequest request);
    Task<CustomerResponseDto> Update(int id, UpdateCustomerRequest request);
    Task Delete(int id, int userId);
    Task<PagedResultDto<CustomerResponseDto>> GetByFilter(CustomerFilterDto filter);
}
