using System.Text;
using hackathon.API.Data;
using hackathon.API.Infrastructure;
using hackathon.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.EnableRetryOnFailure(3)
    ).UseSnakeCaseNamingConvention();
});

// ── Authentication / JWT ─────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret configuration is missing.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000"  // allow local testing from other origins during dev
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// ── CSMS HTTP Client ──────────────────────────────────────────────────────
var csmsBaseUrl = builder.Configuration["Csms:BaseUrl"] ?? "http://localhost:3000";
builder.Services.AddHttpClient<ICsmsClient, CsmsClient>(client =>
{
    client.BaseAddress = new Uri(csmsBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

// ── Application Services ──────────────────────────────────────────────────
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IChargerService, ChargerService>();

// ── Background Services (P1) ──────────────────────────────────────────────
// SessionSyncService: polls CSMS every 30s to sync active sessions into local DB
// NoShowCheckerService: marks Confirmed bookings as NoShow after grace period
// ReminderSchedulerService: sends in-app notifications for upcoming sessions
builder.Services.AddHostedService<SessionSyncService>();
builder.Services.AddHostedService<NoShowCheckerService>();
builder.Services.AddHostedService<ReminderSchedulerService>();

// ── Controllers ───────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ── Swagger ───────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EV Charging Orchestration API",
        Version = "v1",
        Description = "AI-Powered EV Charging Orchestration Platform — Hackathon 2026"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: Bearer eyJhbGci..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Database Migrations + Seed ────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Applying database migrations...");
        await db.Database.MigrateAsync();
        logger.LogInformation("Migrations applied successfully.");

        if (app.Environment.IsDevelopment())
        {
            logger.LogInformation("Seeding demo data...");
            await DataSeeder.SeedAsync(db);
            logger.LogInformation("Seed data complete.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error during database migration/seeding. The app will still start but may not have data.");
    }
}

// ── Middleware Pipeline ────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "EV Charging API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("FrontendDev");

app.UseAuthentication();
app.UseAuthorization();

// ── Health check endpoint ──────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .AllowAnonymous();

app.MapControllers();

app.Run();
