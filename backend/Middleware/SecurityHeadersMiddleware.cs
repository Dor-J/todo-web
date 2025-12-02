namespace backend.Middleware;

/// <summary>
/// Middleware to add security headers to HTTP responses
/// </summary>
public class SecurityHeadersMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<SecurityHeadersMiddleware> _logger;

  public SecurityHeadersMiddleware(
    RequestDelegate next,
    ILogger<SecurityHeadersMiddleware> logger)
  {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    // Add security headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Only add CSP in production
    if (!context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
    {
      context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';");
    }

    await _next(context);
  }
}