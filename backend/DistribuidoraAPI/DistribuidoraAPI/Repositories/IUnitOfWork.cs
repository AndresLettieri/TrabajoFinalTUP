using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;


public interface IUnitOfWork : IDisposable
{
    IBrandRepository Brands { get; }
    ICategoryRepository Categories { get; }
    ICustomerRepository Customers { get; }
    IPaymentMethodRepository PaymentMethods { get; }
    IProductRepository Products { get; }
    IVendorRepository Vendors { get; }
    IUserRepository Users { get; }

    IRepository<T> GetRepository<T>() where T : class;
    Task<int> SaveChanges();
    Task BeginTransaction();
    Task Commit();
    Task Rollback();
}
