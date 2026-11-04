namespace DistribuidoraAPI.DTOs.Category;

public class CategoryResponseDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public bool Active { get; set; }
}