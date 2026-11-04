using DistribuidoraAPI.Models;

namespace DistribuidoraAPI.Models;

public class Order : BaseEntity
{
    public int Number { get; set; }

    public int CustomerId { get; set; }

    public int UserId { get; set; }

    public int PaymentMethodId { get; set; }

    public DateTime Date { get; set; }

    public decimal Total { get; set; }

    public bool Cancelled { get; set; }

    public Customer Customer { get; set; } = null!;

    public User User { get; set; } = null!;

    public PaymentMethod PaymentMethod { get; set; } = null!;

    public ICollection<OrderDetail> Details { get; set; } = new List<OrderDetail>();
}