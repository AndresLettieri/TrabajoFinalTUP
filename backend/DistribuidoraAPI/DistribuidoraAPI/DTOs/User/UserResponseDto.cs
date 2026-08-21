
using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.DTOs.User
{
    public class UserResponseDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required Role Role { get; set; }
    }
}
