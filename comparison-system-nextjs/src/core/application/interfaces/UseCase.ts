export interface UseCase<TPayload, TResponse> {
  execute: (payload: TPayload) => Promise<TResponse>;
}

