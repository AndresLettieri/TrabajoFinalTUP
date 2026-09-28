namespace DistribuidoraAPI.DTOs.Brand;

public class CreateBrandRequest
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}
