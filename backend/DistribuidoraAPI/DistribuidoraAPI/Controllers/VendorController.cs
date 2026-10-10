using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Customer;
using DistribuidoraAPI.DTOs.Vendor;
using DistribuidoraAPI.Services;
using DistribuidoraAPI.Services.Implementations;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/vendors")]
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;

    public VendorController(IVendorService vendorService)
    {
        _vendorService = vendorService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VendorResponseDto>>> GetAll()
    {
        var vendors = await _vendorService.GetAll();
        return Ok(vendors);
    }

    [HttpGet("getByFilter")]
    public async Task<ActionResult<PagedResultDto<VendorResponseDto>>> GetByFilter([FromQuery] VendorFilterDto filter)
    {
        var vendors = await _vendorService.GetByFilter(filter);
        return Ok(vendors);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VendorResponseDto>> GetById(int id)
    {
        var vendor = await _vendorService.GetById(id);
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<ActionResult<VendorResponseDto>> Create(CreateVendorRequest request)
    {
        var response = await _vendorService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<VendorResponseDto>> Update(
        int id,
        UpdateVendorRequest request)
    {
        var response = await _vendorService.Update(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] AuditUserDto auditUserDto)
    {
        await _vendorService.Delete(id, auditUserDto.UserId);
        return NoContent();
    }


    [HttpPatch("{id:int}/activate")]
    public async Task<IActionResult> Activate(int id, [FromBody] AuditUserDto auditUserDto)
    {
        try
        {
            await _vendorService.Activate(id, auditUserDto.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
