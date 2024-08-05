import {
  WGAPIWithAccessToken,
  WGAPIWithAccountIDs,
  WGAPIWithExtra,
  WGDataWithAccountId,
} from '../../../wg/src/type';
import { WOTBAPIWithLanguage } from './wotb';

export enum PlayerPersonalDataExtra {
  GroupedContacts = 'private.grouped_contacts',
  Rating = 'statistics.rating',
}

export type PlayerPersonalDataParams = WGAPIWithAccountIDs &
  Partial<WGAPIWithAccessToken> &
  Partial<WGAPIWithExtra<PlayerPersonalDataExtra>> &
  Partial<WOTBAPIWithLanguage>;

export type PlayerPersonalData = WGDataWithAccountId & {
  /** Date when player's account was created */
  created_at: number;
  /** Last battle time */
  last_battle_time: number;
  /** Player name */
  nickname: string;
  /** Date when player details were updated */
  updated_at: number;
  /** Player's private data */
  private: PlayerPersonalDataPrivate;
  /** Player statistics */
  statistics: PlayerPersonalDataStatistics;
};

export type PlayerPersonalDataStatistics = {};

export type PlayerPersonalDataPrivate = {
  /** Account ban details */
  ban_info: string;
  /** End time of account ban */
  ban_time: number;
  /** Overall battle life time in seconds */
  battle_life_time: number;
  /** Credits */
  credits: number;
  /** Free Experience */
  free_xp: number;
  /** Gold */
  gold: number;
  /** Indicates if the account is Premium Account */
  is_premium: boolean;
  /** Premium Account expiration time */
  premium_expires_at: number;
  /** Contact groups. */
  grouped_contacts: PlayerPersonalDataPrivateGroupedContacts;
  /** Account restrictions */
  restrictions: PlayerPersonalDataPrivateRestrictions;
};

export type PlayerPersonalDataPrivateGroupedContacts = {
  /** Blocked */
  blocked: number[];
  /** Groups */
  groups: unknown;
  /** Not grouped */
  ungrouped: number[];
};

export type PlayerPersonalDataPrivateRestrictions = {
  /** End time of chat ban */
  chat_ban_time: number;
};
