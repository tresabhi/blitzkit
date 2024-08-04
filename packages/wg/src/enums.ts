/**
 * The type of the Wargaming Application. A server application has a default
 * rate limit of `20 Hz` and a mobile application has a default rate limit of
 * `10 Hz`.
 */
export enum WGAppType {
  Server,
  Mobile,
}

/**
 * The default rate limit of the Wargaming Application.
 */
export const WGAppTypeDefaultRateLimits: Record<WGAppType, number> = {
  [WGAppType.Server]: 20,
  [WGAppType.Mobile]: 10,
};

/**
 * The response status of the Wargaming API.
 */
export enum WGResponseStatus {
  Success = 'ok',
  Error = 'error',
}
