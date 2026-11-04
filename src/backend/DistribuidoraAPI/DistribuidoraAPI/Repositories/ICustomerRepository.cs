using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Customer;
using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<bool> ExistsByDocument(string document);
    Task<IEnumerable<Customer>> GetActiveCustomers();
    Task<Customer?> GetActiveCustomerById(int id);
    Task<PagedResultDto<Customer>> GetFilteredCustomers(CustomerFilterDto filter);
}
