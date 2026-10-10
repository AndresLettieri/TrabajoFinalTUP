using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.DTOs;

namespace DistribuidoraAPI.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAll();
    Task<UserResponseDto?> GetById(int id);
    Task<UserResponseDto> Create(CreateUserRequest request);
    Task<UserResponseDto> Update(int id, UpdateUserRequest request);
    Task Delete(int id, int userId);
    Task<UserResponseDto> GetByEmailAndPassword(string email, string password);
    Task<PagedResultDto<UserResponseDto>> GetByFilter(UserFilterDto filter);
    Task Activate(int id, int userId);
}
