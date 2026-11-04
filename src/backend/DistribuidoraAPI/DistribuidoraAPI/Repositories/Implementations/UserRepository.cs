using DistribuidoraAPI.Data;
using DistribuidoraAPI.Models;
using Microsoft.EntityFrameworkCore;
using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.User;

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

        public async Task<PagedResultDto<User>> GetFilteredUsers(UserFilterDto filter)
        {
            var query = _dbSet.AsQueryable();
            if (!string.IsNullOrWhiteSpace(filter.Name))
                query = query.Where(u =>
                    u.Name.ToLower().Contains(filter.Name.ToLower()));
            if (!string.IsNullOrWhiteSpace(filter.Email))
                query = query.Where(u =>
                    u.Email.ToLower().Contains(filter.Email.ToLower()));
            if (filter.Active.HasValue)
                query = query.Where(u =>
                    u.Active == filter.Active.Value);
            if (filter.role.HasValue)
                query = query.Where(u =>
                    u.Role == filter.role.Value);
            var totalItems = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.Name)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
            return new PagedResultDto<User>
            {
                Items = users,
                TotalItems = totalItems,
                Page = filter.Page,
                PageSize = filter.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalItems / filter.PageSize)
            };
        }
    }
}
