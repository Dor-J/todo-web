using Ganss.Xss;

namespace backend.Services;

/// <summary>
/// Service for sanitizing HTML content to prevent XSS attacks
/// </summary>
public interface IHtmlSanitizerService
{
  /// <summary>
  /// Sanitizes HTML content by removing dangerous scripts and tags
  /// </summary>
  /// <param name="input">The input string to sanitize</param>
  /// <returns>Sanitized string, or null if input was null</returns>
  string? Sanitize(string? input);
}

/// <summary>
/// Implementation of HTML sanitization service using HtmlSanitizer library
/// </summary>
public class HtmlSanitizerService : IHtmlSanitizerService
{
  private readonly HtmlSanitizer _sanitizer;

  public HtmlSanitizerService()
  {
    _sanitizer = new HtmlSanitizer();
    // Configure sanitizer to strip all HTML tags (most secure approach)
    // This will remove all HTML tags and return plain text
    _sanitizer.AllowedTags.Clear();
    _sanitizer.AllowedAttributes.Clear();
  }

  public string? Sanitize(string? input)
  {
    if (input is null)
    {
      return null;
    }

    // Sanitize the input - this will strip all HTML tags and dangerous content
    return _sanitizer.Sanitize(input);
  }
}

