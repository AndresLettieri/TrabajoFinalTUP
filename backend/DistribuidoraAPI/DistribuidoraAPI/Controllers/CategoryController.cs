using DistribuidoraAPI.DTOs.Category;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    
    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetAll()
    {
        var categories = await _categoryService.GetAll();
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> GetById(int id)
    {
        var category = await _categoryService.GetById(id);
        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> Create(CreateCategoryRequest request)
    {
        var response = await _categoryService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> Update(
        int id,
        UpdateCategoryRequest request)
    {
        var response = await _categoryService.Update(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] int userId)
    {
        await _categoryService.Delete(id, userId);
        return NoContent();
    }
}
