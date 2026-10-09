using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Customer;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/customers")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetAll()
    {
        var customers = await _customerService.GetAll();
        return Ok(customers);
    }

    [HttpGet("getByFilter")]
    public async Task<ActionResult<PagedResultDto<CustomerResponseDto>>> GetByFilter([FromQuery] CustomerFilterDto filter)
    {
        var customers = await _customerService.GetByFilter(filter);
        return Ok(customers);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerResponseDto>> GetById(int id)
    {
        var customer = await _customerService.GetById(id);
        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerResponseDto>> Create(CreateCustomerRequest request)
    {
        var response = await _customerService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CustomerResponseDto>> Update(
        int id,
        UpdateCustomerRequest request)
    {
        var response = await _customerService.Update(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] AuditUserDto auditUserDto)
    {
        await _customerService.Delete(id, auditUserDto.UserId);
        return NoContent();
    }
}
