using DistribuidoraAPI.DTOs.PaymentMethod;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/payment-methods")]
public class PaymentMethodController : ControllerBase
{
    private readonly IPaymentMethodService _paymentMethodService;

    public PaymentMethodController(IPaymentMethodService paymentMethodService)
    {
        _paymentMethodService = paymentMethodService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentMethodResponseDto>>> GetAll()
    {
        var paymentMethods = await _paymentMethodService.GetAll();
        return Ok(paymentMethods);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaymentMethodResponseDto>> GetById(int id)
    {
        var paymentMethod = await _paymentMethodService.GetById(id);

        if (paymentMethod is null)
            return NotFound();

        return Ok(paymentMethod);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentMethodResponseDto>> Create(
        CreatePaymentMethodRequest request)
    {
        try
        {
            var response = await _paymentMethodService.Create(request);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PaymentMethodResponseDto>> Update(
        int id,
        UpdatePaymentMethodRequest request)
    {
        try
        {
            var response = await _paymentMethodService.Update(id, request);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] int userId)
    {
        try
        {
            await _paymentMethodService.Delete(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
