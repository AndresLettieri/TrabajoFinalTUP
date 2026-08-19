namespace DistribuidoraAPI.DTOs.Category;

public class UpdateCategoryRequest
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}