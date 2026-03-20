export interface HttpInterceptor {
  onRequest?(url: string, init: RequestInit): Promise<[string, RequestInit]>;
  onResponse?(response: Response): Promise<Response>;
}

