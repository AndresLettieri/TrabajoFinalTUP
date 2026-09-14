using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Mvc;
using DistribuidoraAPI.DTOs;

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
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> Create(CreateUserRequest request)
    {
        var response = await _userService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> Update(
        int id,
        UpdateUserRequest request)
    {
        var response = await _userService.Update(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, [FromBody] AuditUserDto auditUserDto)
    {
        await _userService.Delete(id, auditUserDto.UserId);
        return NoContent();
    }
}

