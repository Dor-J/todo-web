namespace backend.Services;

/// <summary>
/// Service for monitoring and alerting on security events
/// </summary>
public interface ISecurityMonitoringService
{
  /// <summary>
  /// Records a failed validation attempt
  /// </summary>
  void RecordValidationFailure(string endpoint, string reason, string? clientIp = null);

  /// <summary>
  /// Records a suspicious activity pattern
  /// </summary>
  void RecordSuspiciousActivity(string activity, string? clientIp = null);

  /// <summary>
  /// Checks if an IP should be blocked based on activity patterns
  /// </summary>
  bool ShouldBlockIp(string? clientIp);
}

/// <summary>
/// Implementation of security monitoring service
/// </summary>
public class SecurityMonitoringService : ISecurityMonitoringService
{
  private readonly ILogger<SecurityMonitoringService> _logger;
  private readonly Dictionary<string, List<DateTime>> _validationFailures = new();
  private readonly Dictionary<string, List<DateTime>> _suspiciousActivities = new();
  private readonly object _lock = new();

  // Thresholds
  private const int MaxValidationFailuresPerMinute = 10;
  private const int MaxSuspiciousActivitiesPerMinute = 5;
  private readonly TimeSpan _timeWindow = TimeSpan.FromMinutes(1);

  public SecurityMonitoringService(ILogger<SecurityMonitoringService> logger)
  {
    _logger = logger;
  }

  public void RecordValidationFailure(string endpoint, string reason, string? clientIp = null)
  {
    if (string.IsNullOrEmpty(clientIp))
      return;

    lock (_lock)
    {
      var now = DateTime.UtcNow;
      if (!_validationFailures.ContainsKey(clientIp))
      {
        _validationFailures[clientIp] = new List<DateTime>();
      }

      _validationFailures[clientIp].Add(now);
      
      // Clean old entries
      _validationFailures[clientIp].RemoveAll(t => t < now - _timeWindow);

      var count = _validationFailures[clientIp].Count;
      
      _logger.LogWarning(
        "Validation failure on {Endpoint}: {Reason} | IP: {IpAddress} | Count in last minute: {Count}",
        endpoint,
        reason,
        clientIp,
        count);

      if (count >= MaxValidationFailuresPerMinute)
      {
        _logger.LogError(
          "SECURITY ALERT: Excessive validation failures from {IpAddress} on {Endpoint} ({Count} in last minute)",
          clientIp,
          endpoint,
          count);
      }
    }
  }

  public void RecordSuspiciousActivity(string activity, string? clientIp = null)
  {
    if (string.IsNullOrEmpty(clientIp))
      return;

    lock (_lock)
    {
      var now = DateTime.UtcNow;
      if (!_suspiciousActivities.ContainsKey(clientIp))
      {
        _suspiciousActivities[clientIp] = new List<DateTime>();
      }

      _suspiciousActivities[clientIp].Add(now);
      
      // Clean old entries
      _suspiciousActivities[clientIp].RemoveAll(t => t < now - _timeWindow);

      var count = _suspiciousActivities[clientIp].Count;
      
      _logger.LogWarning(
        "Suspicious activity detected: {Activity} | IP: {IpAddress} | Count in last minute: {Count}",
        activity,
        clientIp,
        count);

      if (count >= MaxSuspiciousActivitiesPerMinute)
      {
        _logger.LogError(
          "SECURITY ALERT: Excessive suspicious activity from {IpAddress}: {Activity} ({Count} in last minute)",
          clientIp,
          activity,
          count);
      }
    }
  }

  public bool ShouldBlockIp(string? clientIp)
  {
    if (string.IsNullOrEmpty(clientIp))
      return false;

    lock (_lock)
    {
      var now = DateTime.UtcNow;
      
      // Check validation failures
      if (_validationFailures.TryGetValue(clientIp, out var failures))
      {
        failures.RemoveAll(t => t < now - _timeWindow);
        if (failures.Count >= MaxValidationFailuresPerMinute)
        {
          return true;
        }
      }

      // Check suspicious activities
      if (_suspiciousActivities.TryGetValue(clientIp, out var activities))
      {
        activities.RemoveAll(t => t < now - _timeWindow);
        if (activities.Count >= MaxSuspiciousActivitiesPerMinute)
        {
          return true;
        }
      }

      return false;
    }
  }
}