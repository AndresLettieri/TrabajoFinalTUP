using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Repositories.Implementations
{
    public class UserRepository : RepositoryBase<Models.User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }
        public async Task<User?> GetByEmail(string email)
        {
            return await _dbSet
                .Where(u => u.Email.ToLower() == email.ToLower() && u.Active)
                .FirstOrDefaultAsync();
        }
        public async Task<IEnumerable<User>> GetActiveUsers()
        {
            return await _dbSet
                .Where(u => u.Active)
                .OrderBy(u => u.Name)
                .ToListAsync();
        }
        public async Task<User?> GetActiveUserById(int id)
        {
            return await _dbSet
                .Where(u => u.Id == id && u.Active)
                .FirstOrDefaultAsync();
        }
    }
}
