using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Brand;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandResponseDto>>> GetAll()
    {
        var brands = await _brandService.GetAll();
        return Ok(brands);
    }


    [HttpGet("getByFilter")]
    public async Task<ActionResult<PagedResultDto<BrandResponseDto>>> GetByFilter([FromQuery] BrandFilterDto filter)
    {
        var brands = await _brandService.GetByFilter(filter);
        return Ok(brands);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BrandResponseDto>> GetById(int id)
    {
        var brand = await _brandService.GetById(id);

        if (brand is null)
            return NotFound();

        return Ok(brand);
    }

    [HttpPost]
    public async Task<ActionResult<BrandResponseDto>> Create(CreateBrandRequest request)
    {
        try
        {
            var response = await _brandService.Create(request);
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
    public async Task<ActionResult<BrandResponseDto>> Update(
        int id,
        UpdateBrandRequest request)
    {
        try
        {
            var response = await _brandService.Update(id, request);
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
    public async Task<IActionResult> Delete(int id, [FromBody] AuditUserDto auditUserDto)
    {
        try
        {
            await _brandService.Delete(id, auditUserDto.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/activate")]
    public async Task<IActionResult> Activate(int id, [FromBody] AuditUserDto auditUserDto)
    {
        try
        {
            await _brandService.Activate(id, auditUserDto.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
