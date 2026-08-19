using DistribuidoraAPI.Enums;

namespace DistribuidoraAPI.Models;

public class StockMovement
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public StockMovementType Type { get; set; }

    public int Quantity { get; set; }

    public int ReferenceId { get; set; }

    public Product Product { get; set; } = null!;
}