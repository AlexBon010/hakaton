export class HttpError extends Error {
  status?: number;
  body?: unknown;

  constructor(
    message: string,
    options?: {
      status?: number;
      body?: unknown;
    },
  ) {
    super(message);

    this.status = options?.status;
    this.body = options?.body;
  }
}

