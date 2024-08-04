export enum PlayerParamsType {
  /**
   * Search by initial characters of player name. Minimum length: 3 characters.
   * Maximum length: 24 characters. (by default)
   */
  StartsWith = 'startswith',
  /**
   * Search by exact match of player name. Case insensitive. You can enter
   * several names, separated with commas (up to 100).
   */
  Exact = 'exact',
}
