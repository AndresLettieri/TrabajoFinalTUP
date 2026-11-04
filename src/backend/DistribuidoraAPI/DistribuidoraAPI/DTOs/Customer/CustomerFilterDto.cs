namespace DistribuidoraAPI.DTOs.Customer
{
    public class CustomerFilterDto : PaginationRequestDto
    {
        public string? Name { get; set; }
        public string? Document { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool? Active { get; set; }
    }
}
