using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories;


public interface IUnitOfWork : IDisposable
{
    ICategoryRepository Categories { get; }
    IRepository<T> GetRepository<T>() where T : class;
    Task<int> SaveChanges();
    Task BeginTransaction();
    Task Commit();
    Task Rollback();
}
