using System.Diagnostics;

namespace backend.Middleware;

/// <summary>
/// Middleware to log HTTP requests and responses with timing information
/// </summary>
public class RequestLoggingMiddleware
{
  private readonly RequestDelegate _next;
  private readonly ILogger<RequestLoggingMiddleware> _logger;

  public RequestLoggingMiddleware(
    RequestDelegate next,
    ILogger<RequestLoggingMiddleware> logger)
  {
    _next = next;
    _logger = logger;
  }

  public async Task InvokeAsync(HttpContext context)
  {
    var stopwatch = Stopwatch.StartNew();
    var requestPath = context.Request.Path.Value ?? string.Empty;
    var requestMethod = context.Request.Method;
    var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    var userAgent = context.Request.Headers["User-Agent"].ToString();

    // Log request
    _logger.LogInformation(
      "Incoming {Method} request to {Path} from {IpAddress}",
      requestMethod,
      requestPath,
      clientIp);

    try
    {
      await _next(context);
      stopwatch.Stop();

      var statusCode = context.Response.StatusCode;
      var logLevel = statusCode >= 500
        ? LogLevel.Error
        : statusCode >= 400
          ? LogLevel.Warning
          : LogLevel.Information;

      _logger.Log(
        logLevel,
        "Completed {Method} {Path} with status {StatusCode} in {ElapsedMs}ms | IP: {IpAddress} | UserAgent: {UserAgent}",
        requestMethod,
        requestPath,
        statusCode,
        stopwatch.ElapsedMilliseconds,
        clientIp,
        userAgent);

      // Log security events
      if (statusCode == 429)
      {
        _logger.LogWarning(
          "Rate limit exceeded for {IpAddress} on {Path}",
          clientIp,
          requestPath);
      }
    }
    catch (Exception ex)
    {
      stopwatch.Stop();
      _logger.LogError(
        ex,
        "Unhandled exception processing {Method} {Path} from {IpAddress} after {ElapsedMs}ms",
        requestMethod,
        requestPath,
        clientIp,
        stopwatch.ElapsedMilliseconds);
      throw;
    }
  }
}