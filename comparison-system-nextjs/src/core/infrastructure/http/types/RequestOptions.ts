export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean>;
}

