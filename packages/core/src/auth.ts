import { WebflowClient } from 'webflow-api';

export type WebflowAuthConfig =
  { type: 'site-token'; token: string } | { type: 'oauth'; accessToken: string } | { type: 'env' };

export class WebflowAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebflowAuthError';
  }
}

export function resolveToken(config: WebflowAuthConfig): string {
  switch (config.type) {
    case 'site-token':
      return config.token;
    case 'oauth':
      return config.accessToken;
    case 'env': {
      const token = process.env.WEBFLOW_TOKEN;
      if (!token) {
        throw new WebflowAuthError(
          'WEBFLOW_TOKEN environment variable is not set. ' +
            'Set it in your .env file or pass an explicit auth config.',
        );
      }
      return token;
    }
  }
}

export function createClient(config: WebflowAuthConfig): WebflowClient {
  const token = resolveToken(config);
  return new WebflowClient({ accessToken: token });
}
