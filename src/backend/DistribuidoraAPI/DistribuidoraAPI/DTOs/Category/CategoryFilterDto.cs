namespace DistribuidoraAPI.DTOs.Category
{
    public class CategoryFilterDto : PaginationRequestDto
    {
        public string? Name { get; set; }
        public bool? Active { get; set; }
    }
    
}
