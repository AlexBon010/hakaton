import type { HttpClientConfig } from '@/core/infrastructure/http/types/HttpClientConfig';
import type { HttpInterceptor } from '@/core/infrastructure/http/types/HttpInterceptor';
import type { RequestOptions } from '@/core/infrastructure/http/types/RequestOptions';

export abstract class HttpClient {
  protected readonly baseURL: string;
  protected readonly timeout: number;

  private interceptors: HttpInterceptor[] = [];

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 10000;
  }

  addInterceptor(interceptor: HttpInterceptor) {
    this.interceptors.push(interceptor);
  }

  abstract request<T>(url: string, options?: RequestOptions): Promise<T>;

  abstract get<T>(url: string, options?: RequestOptions): Promise<T>;

  abstract post<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T>;
}

