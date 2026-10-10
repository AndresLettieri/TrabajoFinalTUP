using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.Product;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetAll()
    {
        try
        {
            var products = await _productService.GetAll();
            return Ok(products);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("getByFilter")]
    public async Task<ActionResult<PagedResultDto<ProductResponseDto>>> GetByFilter([FromQuery] ProductFilterDto filter)
    {
        var products = await _productService.GetByFilter(filter);
        return Ok(products);
    }

    [HttpGet("stock-alerts")]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetStockAlerts()
    {
        var products = await _productService.GetStockAlerts();
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id)
    {
        var product = await _productService.GetById(id);

        if (product is null)
            return NotFound();

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> Create(CreateProductRequest request)
    {
        try
        {
            var response = await _productService.Create(request);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
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

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> Update(int id, UpdateProductRequest request)
    {
        try
        {
            var response = await _productService.Update(id, request);
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
            await _productService.Delete(id, auditUserDto.UserId);
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
            await _productService.Activate(id, auditUserDto.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
