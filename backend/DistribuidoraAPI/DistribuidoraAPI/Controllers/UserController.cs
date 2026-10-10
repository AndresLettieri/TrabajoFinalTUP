using DistribuidoraAPI.DTOs;
using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll()
    {
        var users = await _userService.GetAll();
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> GetById(int id)
    {
        var user = await _userService.GetById(id);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpGet("getByFilter")]
    public async Task<ActionResult<PagedResultDto<UserResponseDto>>> GetByFilter([FromQuery] UserFilterDto filter)
    {
        var vendors = await _userService.GetByFilter(filter);
        return Ok(vendors);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> Create(CreateUserRequest request)
    {

        try
        {
            var response = await _userService.Create(request);
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
    public async Task<ActionResult<UserResponseDto>> Update(
        int id,
        UpdateUserRequest request)
    {
        try
        {
            var response = await _userService.Update(id, request);
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
            await _userService.Delete(id, auditUserDto.UserId);
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
            await _userService.Activate(id, auditUserDto.UserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}

