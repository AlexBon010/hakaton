import type { HttpClient } from '@/core/infrastructure/http/HttpClient';

export abstract class Repository {
  protected readonly http: HttpClient;

  constructor(httpClient: HttpClient) {
    this.http = httpClient;
  }
}

