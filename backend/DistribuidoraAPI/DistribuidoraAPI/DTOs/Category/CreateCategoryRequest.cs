namespace DistribuidoraAPI.DTOs.Category;

public class CreateCategoryRequest
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}