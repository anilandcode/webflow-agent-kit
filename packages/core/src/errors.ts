export class WebflowAgentError extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'WebflowAgentError';
  }
}

export class RateLimitError extends WebflowAgentError {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends WebflowAgentError {
  constructor(
    message: string,
    public readonly resourceType: string,
    public readonly resourceId: string,
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends WebflowAgentError {
  constructor(
    message: string,
    public readonly zodErrors?: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isWebflowAgentError(error: unknown): error is WebflowAgentError {
  return error instanceof WebflowAgentError;
}
