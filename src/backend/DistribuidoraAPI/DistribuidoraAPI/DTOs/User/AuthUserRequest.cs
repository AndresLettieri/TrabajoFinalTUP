namespace DistribuidoraAPI.DTOs.User
{
    public class AuthUserRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
