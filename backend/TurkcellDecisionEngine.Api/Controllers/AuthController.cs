using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TurkcellDecisionEngine.Api.DTOs;
using TurkcellDecisionEngine.Core.Interfaces;

namespace TurkcellDecisionEngine.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var (user, token) = await _authService.LoginAsync(loginDto.UserId, loginDto.Password);
        
        if (user == null || token == null)
        {
            return Unauthorized(new { message = "Geçersiz kullanıcı adı veya şifre" });
        }

        return Ok(new TokenResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Name = user.Name,
            Role = user.Role.ToString(),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<UserInfoDto> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var city = User.FindFirst("city")?.Value;
        var email = User.FindFirst("email")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        return Ok(new UserInfoDto
        {
            UserId = userId,
            Name = name ?? "",
            City = city ?? "",
            Email = email,
            Role = role ?? "User"
        });
    }

    [HttpPost("logout")]
    public ActionResult Logout()
    {
        // JWT is stateless, so logout is handled client-side by removing the token
        return Ok(new { message = "Çıkış başarılı" });
    }
}
