using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DistribuidoraAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        
        public AuthController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register(CreateUserRequest request)
        {
            try
            {
                var response = await _userService.Create(request);
                return Ok(response);
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

        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login(AuthUserRequest request)
        {
            try
            {
                var user = await _userService.GetByEmailAndPassword(request.Email, request.Password);
                if (user is null)
                {
                    return Unauthorized(new { message = "Credenciales inválidas" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al procesar la solicitud", details = ex.Message });
            }
        }
    }
}
