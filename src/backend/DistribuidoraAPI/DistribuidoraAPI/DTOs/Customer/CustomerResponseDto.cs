namespace DistribuidoraAPI.DTOs.Customer;

public class CustomerResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Document { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Observations { get; set; }

    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
}
