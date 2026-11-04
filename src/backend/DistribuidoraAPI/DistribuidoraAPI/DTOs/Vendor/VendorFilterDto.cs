namespace DistribuidoraAPI.DTOs.Vendor
{
    public class VendorFilterDto : PaginationRequestDto
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? City { get; set; }
        public bool? Active { get; set; }
    }
}
