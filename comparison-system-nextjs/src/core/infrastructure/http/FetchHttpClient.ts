import { HttpError } from './errors/HttpError';
import { HttpClient } from './HttpClient';

import type { RequestOptions } from './types/RequestOptions';

export class FetchHttpClient extends HttpClient {
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    let fullUrl = `${this.baseURL}${url}`;

    if (options.query) {
      const params = new URLSearchParams();

      Object.entries(options.query).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      fullUrl += `?${params}`;
    }

    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return this.handleResponse<T>(response);
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    let requestBody: BodyInit | undefined;
    let headers: HeadersInit = { ...options?.headers };

    if (body instanceof FormData) {
      requestBody = body;
    } else if (body !== undefined) {
      requestBody = JSON.stringify(body);
      headers = { ...headers, 'Content-Type': 'application/json' };
    }

    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: requestBody,
      headers,
    });
  }
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorBody: unknown | null = null;
      try {
        errorBody = await response.text();
      } catch {}
      throw new HttpError(`HTTP error ${response.status}`, {
        status: response.status,
        body: errorBody,
      });
    }

    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    } else if (
      contentType?.includes('application/pdf') ||
      contentType?.includes('application/octet-stream')
    ) {
      return (await response.blob()) as unknown as T;
    } else {
      return (await response.text()) as unknown as T;
    }
  }
}

