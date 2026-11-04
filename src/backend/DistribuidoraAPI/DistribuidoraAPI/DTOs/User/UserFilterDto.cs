using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.DTOs.User
{
    public class UserFilterDto : PaginationRequestDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public Role? role { get; set; }
        public bool? Active { get; set; }
    }
}
