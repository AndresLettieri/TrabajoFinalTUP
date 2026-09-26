using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface ICustomerRepository : IRepository<Customer>
{
    Task<bool> ExistsByDocument(string document);
    Task<IEnumerable<Customer>> GetActiveCustomers();
    Task<Customer?> GetActiveCustomerById(int id);
}
