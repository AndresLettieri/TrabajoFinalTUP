using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.Models;

public class User : ActiveEntity
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public Role Role { get; set; }
}