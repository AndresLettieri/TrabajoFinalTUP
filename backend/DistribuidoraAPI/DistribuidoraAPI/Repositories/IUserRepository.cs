using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmail(string email);
        Task<IEnumerable<User>> GetActiveUsers();
        Task<User?> GetActiveUserById(int id);

    }
}
