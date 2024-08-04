import {
  WGAppType,
  WGAppTypeDefaultRateLimits,
  WGResponseStatus,
} from '../enums';
import { WGResponse } from './GameAPI';

interface WGAppConstructorOptions {
  /**
   * 32-character hexadecimal string which uniquely identifies the application.
   */
  id: string;
  /**
   * Specifying the application type here automatically decides the API's rate
   * limit.
   *
   * @default WGAppType.Mobile
   */
  type?: WGAppType;
  /**
   * Rate limit in requests per second (Hz). Decided by the application type if
   * unspecified. Set to `null` to disable rate limiting.
   */
  rate?: number | null;
}

/**
 * Defines the identity and behavior of the Wargaming Application.
 */
export class WGApp implements Required<WGAppConstructorOptions> {
  id: string;
  type: WGAppType;
  rate: number | null;

  constructor(options: WGAppConstructorOptions) {
    this.id = options.id;
    this.type = options.type ?? WGAppType.Mobile;
    this.rate =
      options.rate === undefined
        ? WGAppTypeDefaultRateLimits[this.type]
        : options.rate;
  }

  /**
   *
   */
  async fetchURL<Type>(url: string, params?: {}) {
    const search = new URLSearchParams(
      Object.entries({ application_id: this.id, ...params }).filter(
        ([, value]) => value !== undefined,
      ),
    ).toString();
    const urlConcatenated = `${url}?${search}`;
    const response = await fetch(urlConcatenated);
    const json = (await response.json()) as WGResponse<Type>;

    if (json.status === WGResponseStatus.Error) {
      throw new Error(
        `Failed to fetch ${urlConcatenated.replaceAll(this.id, '[REDACTED]')}`,
        { cause: json.error },
      );
    }

    return json.data;
  }
}
