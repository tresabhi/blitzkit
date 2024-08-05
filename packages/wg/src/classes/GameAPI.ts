import { WGResponseStatus } from '../enums';
import { WGApp } from './WGApp';

interface GameAPIConstructorOptions {
  /** The root URL to which the API slugs and parameters are appended. */
  root: string;
}

export interface WGError {
  field: string | null;
  message: string;
  code: number;
  value: null | string | number | boolean;
}

export type WGResponse<Data> =
  | {
      status: WGResponseStatus.Error;
      error: WGError;
    }
  | {
      status: WGResponseStatus.Success;
      meta: unknown;
      data: Data;
    };

/** Bare-bones tools for working with any Wargaming game API. */
export class GameAPI implements GameAPIConstructorOptions {
  root: string;

  constructor(
    public app: WGApp,
    options: GameAPIConstructorOptions,
  ) {
    this.root = options.root;
  }

  /** Fetches any path of the root URL. */
  async fetchPath<Type>(path: string, params?: {}) {
    return this.app.fetchURL<Type>(`${this.root}${path}/`, params);
  }
}
