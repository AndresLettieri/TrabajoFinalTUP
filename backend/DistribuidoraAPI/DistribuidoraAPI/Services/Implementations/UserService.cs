
using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.Models;
using DistribuidoraAPI.Repositories;
using DistribuidoraAPI.Services.Security;

namespace DistribuidoraAPI.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
        }

        public async Task<IEnumerable<UserResponseDto>> GetAll()
        {
            var users = await _unitOfWork.Users.GetActiveUsers();

            return users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role
            }).ToList();
        }

        public async Task<UserResponseDto?> GetById(int id)
        {
            var user = await _unitOfWork.Users.GetActiveUserById(id);
            if (user is null)
                return null;
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }


        public async Task<UserResponseDto> Create(CreateUserRequest request)
        {
            ValidateUserRequest(request);
            ValidateDuplicateMail(request.Email);

            // Hash seguro de la contraseña
            var hashedPassword = _passwordHasher.HashPassword(request.Password);

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = request.Email.Trim(),
                Password = hashedPassword, 
                Role = request.Role,
                Active = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = request.UserId
            };

            _unitOfWork.Users.Add(user);
            await _unitOfWork.SaveChanges();
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<UserResponseDto> Update(int id, UpdateUserRequest request)
        {
            ValidateUserRequest(request);

            var user = await _unitOfWork.Users.GetActiveUserById(id);
            if (user is null)
                throw new KeyNotFoundException($"No se encontró el usuario con ID {id}");

            // Verificar si el nuevo email ya existe (y no es del mismo usuario)
            if (!user.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
            {
                ValidateDuplicateMail(request.Email);
            }

            user.Name = request.Name.Trim();
            user.Email = request.Email.Trim();
            user.Password = _passwordHasher.HashPassword(request.Password);
            user.Role = request.Role;
            user.ModifiedAt = DateTime.UtcNow;
            user.ModifiedBy = request.UserId;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChanges();

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task Delete(int id, int userId)
        {
            var user = await _unitOfWork.Users.GetActiveUserById(id);
            if (user is null)
                throw new KeyNotFoundException($"No se encontró el usuario con ID {id}");

            user.Active = false;
            user.ModifiedAt = DateTime.UtcNow;
            user.ModifiedBy = userId;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChanges();
        }

        public async Task<UserResponseDto> GetByEmailAndPassword(string email, string password)
        {
            var user = await _unitOfWork.Users.GetByEmail(email);
            if (user is null || !_passwordHasher.VerifyPassword(password, user.Password))
                throw new UnauthorizedAccessException("Email o contraseña incorrectos");
            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        private void ValidateUserRequest(dynamic request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("El nombre del usuario no puede estar vacío");
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("El email del usuario no puede estar vacío");
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("La contraseña del usuario no puede estar vacía");
        }

        private void ValidateDuplicateMail(string email)
        {
            var existingUser = _unitOfWork.Users.GetByEmail(email).Result;
            if (existingUser is not null)
            {
                throw new InvalidOperationException($"Ya existe un usuario con el email '{email}'");
            }
        }

    }
}
