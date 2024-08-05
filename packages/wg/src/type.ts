export interface WGAPIWithAccountID {
  /** Player account ID. */
  account_id: number;
}

export interface WGAPIWithAccountIDs {
  /** Player account ID. Maximum limit: 100. */
  account_id: number | number[];
}

export interface WGAPIWithAccessToken {
  /**
   * [Access
   * token](https://developers.wargaming.net/documentation/guide/principles/#access_token)
   * for the private data of a user's account; can be received via the
   * authorization method; valid within a stated time period
   */
  access_token: string;
}

export interface WGAPIWithExtra<Extra> {
  extra: Extra;
}

export interface WGDataWithAccountId {
  /** Player account ID */
  account_id: number;
}
