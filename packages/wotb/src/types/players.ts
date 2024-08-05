import { WOTBAPIWithLanguage } from './wotb';

export type Players<
  IncludeFields extends PlayersEntryFields,
  ExcludeFields extends PlayersEntryFields,
> = Omit<Pick<PlayersEntry, IncludeFields>, ExcludeFields>[];

export type PlayerParams = WOTBAPIWithLanguage & {
  /**
   * Number of returned entries (fewer can be returned, but not more than 100).
   * If the limit sent exceeds 100, a limit of None is applied (by default).
   */
  limit?: number;
} & (
    | {
        /**
         * Search type.
         *
         * @default PlayerParamsType.StartsWith
         */
        type?: PlayerParamsType.StartsWith;
        /**
         * Player name search string. Parameter "type" defines minimum length
         * and type of search. Using the exact search type, you can enter
         * several names, separated with commas. Maximum length: 24.
         */
        search: string;
      }
    | {
        /**
         * Search type.
         *
         * @default PlayerParamsType.StartsWith
         */
        type: PlayerParamsType.Exact;
        /**
         * Player name search string. Parameter "type" defines minimum length
         * and type of search. Using the exact search type, you can enter
         * several values into the search field as an array.
         */
        search: string | string[];
      }
  );

export interface PlayersEntry {
  account_id: number;
  nickname: string;
}

export type PlayersEntryFields = keyof PlayersEntry;

export type PlayersEntryDefaultFields = 'account_id' | 'nickname';

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
