using DistribuidoraAPI.Data;
using DistribuidoraAPI.DTOs.Category;
using DistribuidoraAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoryController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetAll()
    {
        var categories = await _context.Categories
            .Where(c => c.Active)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/categories/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> GetById(int id)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id && c.Active)
            .Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .FirstOrDefaultAsync();

        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> Create(
        CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            Active = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UserId
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync();

        var response = new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.Id },
            response);
    }

    // PUT: api/categories/1
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> Update(
        int id,
        UpdateCategoryRequest request)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.Active);

        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name;
        category.ModifiedAt = DateTime.UtcNow;
        category.ModifiedBy = request.UserId;

        await _context.SaveChangesAsync();

        var response = new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name
        };

        return Ok(response);
    }

    // DELETE: api/categories/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] int userId)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.Active);

        if (category is null)
        {
            return NotFound();
        }

        category.Active = false;
        category.ModifiedAt = DateTime.UtcNow;
        category.ModifiedBy = userId;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}