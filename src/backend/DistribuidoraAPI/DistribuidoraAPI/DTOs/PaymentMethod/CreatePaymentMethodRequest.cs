namespace DistribuidoraAPI.DTOs.PaymentMethod;

public class CreatePaymentMethodRequest
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}
