using DistribuidoraAPI.Models;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.User;

namespace DistribuidoraAPI.Repositories
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmail(string email);
        Task<IEnumerable<User>> GetActiveUsers();
        Task<User?> GetActiveUserById(int id);
        Task<PagedResultDto<User>> GetFilteredUsers(UserFilterDto filter);

    }
}
