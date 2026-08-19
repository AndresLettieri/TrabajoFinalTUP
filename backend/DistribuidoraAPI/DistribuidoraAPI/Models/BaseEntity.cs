namespace DistribuidoraAPI.Models;

public abstract class BaseEntity
{
    public int Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public int CreatedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }
    public int? ModifiedBy { get; set; }
}