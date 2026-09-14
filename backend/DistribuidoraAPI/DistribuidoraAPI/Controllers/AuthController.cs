using DistribuidoraAPI.DTOs.User;
using DistribuidoraAPI.Services;
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
            var response = await _userService.Create(request);
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login(AuthUserRequest request)
        {
            var user = await _userService.GetByEmailAndPassword(request.Email, request.Password);
            return Ok(user);
        }
    }
}
