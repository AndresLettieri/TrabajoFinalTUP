using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.DTOs.User
{
    public class UpdateUserRequest : AuditUserDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required Role Role { get; set; }

    }
}
