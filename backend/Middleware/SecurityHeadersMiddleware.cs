namespace backend.Middleware;

/// <summary>
/// Middleware to add security headers to HTTP responses
/// </summary>
public class SecurityHeadersMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<SecurityHeadersMiddleware> _logger;
  private readonly IWebHostEnvironment _environment;

  public SecurityHeadersMiddleware(
    RequestDelegate next,
    ILogger<SecurityHeadersMiddleware> logger,
    IWebHostEnvironment environment)
  {
    _next = next;
    _logger = logger;
    _environment = environment;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    // Add security headers
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Strict Transport Security (HSTS) - only in production with HTTPS
    if (!_environment.IsDevelopment() && context.Request.IsHttps)
    {
      context.Response.Headers.Append(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload");
    }
    
    // Content Security Policy
    var csp = BuildCsp(context);
    context.Response.Headers.Append("Content-Security-Policy", csp);
    
    // Report-Only mode for development (allows testing without breaking)
    if (_environment.IsDevelopment())
    {
      context.Response.Headers.Append("Content-Security-Policy-Report-Only", csp);
    }

    await _next(context);
  }

  private string BuildCsp(HttpContext context)
  {
    var baseUrl = $"{context.Request.Scheme}://{context.Request.Host}";
    
    // Strict CSP policy
    var directives = new List<string>
    {
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 'unsafe-eval' needed for Angular in dev
      "style-src 'self' 'unsafe-inline'", // Angular requires inline styles
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' " + baseUrl, // Allow API calls to same origin
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests" // Force HTTPS for all resources
    };

    // In production, remove unsafe directives
    if (!_environment.IsDevelopment())
    {
      directives = directives.Select(d => 
        d.Replace(" 'unsafe-inline' 'unsafe-eval'", "")
         .Replace(" 'unsafe-inline'", "")
      ).ToList();
    }

    return string.Join("; ", directives);
  }
}