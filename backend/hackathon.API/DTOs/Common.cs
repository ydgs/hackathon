namespace hackathon.API.DTOs;

/// <summary>Standard error response shape per api-contract.md §7</summary>
public class ApiError
{
    public string Message { get; set; } = string.Empty;
    public List<ApiErrorDetail> Errors { get; set; } = new();
    public string? TraceId { get; set; }
}

public class ApiErrorDetail
{
    public string? Field { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>Paginated list response</summary>
public class PagedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public PaginationInfo Pagination { get; set; } = new();
}

public class PaginationInfo
{
    public int Page { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public int TotalPages { get; set; }
}

/// <summary>Unpaginated list response</summary>
public class ListResponse<T>
{
    public List<T> Data { get; set; } = new();
}
