namespace DistribuidoraAPI.DTOs;

public sealed record ApiErrorResponse(
    int StatusCode,
    string Message,
    string TraceId,
    IReadOnlyDictionary<string, string[]>? Errors = null);
