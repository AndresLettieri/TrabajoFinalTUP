using DistribuidoraAPI.DTOs;

namespace DistribuidoraAPI.DTOs.Customer;

public class CreateCustomerRequest : AuditUserDto
{
    public required string Name { get; set; }
    public required string Document { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Observations { get; set; }
}
