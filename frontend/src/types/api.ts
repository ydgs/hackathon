// API error envelope shape — matches api-contract.md §7

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
  metadata?: Record<string, string>;
}

export interface ApiError {
  message: string;
  errors: ApiErrorDetail[];
  traceId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ListResponse<T> {
  data: T[];
}
