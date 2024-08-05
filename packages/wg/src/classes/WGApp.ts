import {
  WGAppType,
  WGAppTypeDefaultRateLimits,
  WGResponseStatus,
} from '../enums';
import { WGResponse } from './GameAPI';

interface WGAppConstructorOptions {
  /** 32-character hexadecimal string which uniquely identifies the application. */
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
  /**
   * If this error code is encountered, the request will be put back in the
   * queue and retried. Set to `[]` to disable retries.
   *
   * @default ['REQUEST_LIMIT_EXCEEDED']
   */
  retryErrors?: string[];
}

/** Defines the identity and behavior of the Wargaming Application. */
export class WGApp implements Required<WGAppConstructorOptions> {
  id: string;
  type: WGAppType;
  rate: number | null;
  retryErrors: string[];

  private inProgress = 0;
  private queue: { url: string; resolve: (data: unknown) => void }[] = [];

  constructor(options: WGAppConstructorOptions) {
    this.id = options.id;
    this.type = options.type ?? WGAppType.Mobile;
    this.rate =
      options.rate === undefined
        ? WGAppTypeDefaultRateLimits[this.type]
        : options.rate;
    this.retryErrors = options.retryErrors ?? ['REQUEST_LIMIT_EXCEEDED'];
  }

  private decrement() {
    this.inProgress--;
    this.manageQueue();
  }

  private async manageQueue() {
    const decrement: typeof this.decrement = this.decrement.bind(this);

    if (
      this.queue.length > 0 &&
      (this.rate === null ? true : this.inProgress < this.rate)
    ) {
      this.inProgress++;

      const timeout = setTimeout(decrement, 1000);
      const request = this.queue.shift()!;
      const response = await fetch(request.url);
      const json = (await response.json()) as WGResponse<unknown>;

      if (json.status === WGResponseStatus.Error) {
        if (this.retryErrors.includes(json.error.message)) {
          clearTimeout(timeout);
          setTimeout(
            () => {
              this.queue.push(request);
              decrement();
            },
            /**
             * Still use `setTimeout` even with rate limit set to null to avoid
             * stack overflow
             */
            this.rate === null ? 0 : 1000 / this.rate,
          );
        } else {
          clearTimeout(timeout);
          decrement();

          throw new Error(
            `Failed to fetch ${request.url.replaceAll(this.id, '[REDACTED]')}`,
            { cause: json.error },
          );
        }
      } else request.resolve(json.data);
    }
  }

  /**
   * Fetches any URL, expecting data to be returned in the Wargaming response
   * format.
   */
  fetchURL<Type>(url: string, params?: {}) {
    return new Promise<Type>(async (resolve) => {
      const search = new URLSearchParams(
        Object.entries({ application_id: this.id, ...params }).filter(
          ([, value]) => value !== undefined,
        ),
      ).toString();
      const urlConcatenated = `${url}?${search}`;

      this.queue.push({
        url: urlConcatenated,
        resolve(data) {
          resolve(data as Type);
        },
      });
      this.manageQueue();
    });
  }
}
