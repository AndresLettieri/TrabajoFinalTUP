namespace DistribuidoraAPI.Models;

public class Purchase : BaseEntity
{
    public int Number { get; set; }

    public int VendorId { get; set; }

    public DateTime Date { get; set; }

    public decimal Total { get; set; }

    public string? Observations { get; set; }

    public bool Cancelled { get; set; }

    public Vendor Vendor { get; set; } = null!;

    public ICollection<PurchaseDetail> Details { get; set; } = new List<PurchaseDetail>();
}