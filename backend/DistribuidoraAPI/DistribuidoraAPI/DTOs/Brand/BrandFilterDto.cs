namespace DistribuidoraAPI.DTOs.Brand
{
    public class BrandFilterDto : PaginationRequestDto
    {
        public string? Name { get; set; }
        public bool? Active { get; set; }
    }
}
