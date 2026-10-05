namespace DistribuidoraAPI.DTOs.Order;

public class OrderFilterRequest
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public int? CustomerId { get; set; }
    public int? SellerId { get; set; }
    public int? Number { get; set; }
}
