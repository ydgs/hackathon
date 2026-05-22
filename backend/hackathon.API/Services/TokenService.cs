using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using hackathon.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace hackathon.API.Services;

public interface ITokenService
{
    (string token, DateTime expiresAt) GenerateToken(User user);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiresAt) GenerateToken(User user)
    {
        var key = _config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured.");
        var issuer = _config["Jwt:Issuer"] ?? "hackathon-api";
        var audience = _config["Jwt:Audience"] ?? "hackathon-client";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddHours(24);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("displayName", user.DisplayName),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Exp, new DateTimeOffset(expiresAt).ToUnixTimeSeconds().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
