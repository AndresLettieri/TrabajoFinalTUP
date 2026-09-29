namespace DistribuidoraAPI.DTOs.PaymentMethod;

public class UpdatePaymentMethodRequest
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}
