namespace DistribuidoraAPI.Models;

public class Vendor : ActiveEntity
{
    public string Name { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? Observations { get; set; }
}