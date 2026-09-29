using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;

public interface IPaymentMethodRepository : IRepository<PaymentMethod>
{
    Task<PaymentMethod?> GetByName(string name);
    Task<bool> ExistsByName(string name);
    Task<IEnumerable<PaymentMethod>> GetActivePaymentMethods();
    Task<PaymentMethod?> GetActivePaymentMethodById(int id);
}
