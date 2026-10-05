using DistribuidoraAPI.Models;
using System.Data;

namespace DistribuidoraAPI.Repositories;


public interface IUnitOfWork : IDisposable
{
    IBrandRepository Brands { get; }
    ICategoryRepository Categories { get; }
    ICustomerRepository Customers { get; }
    IOrderRepository Orders { get; }
    IPaymentMethodRepository PaymentMethods { get; }
    IProductRepository Products { get; }
    IPurchaseRepository Purchases { get; }
    IVendorRepository Vendors { get; }
    IUserRepository Users { get; }

    IRepository<T> GetRepository<T>() where T : class;
    Task<int> SaveChanges();
    Task BeginTransaction();
    Task BeginTransaction(IsolationLevel isolationLevel);
    Task Commit();
    Task Rollback();
}
