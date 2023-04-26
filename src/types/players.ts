import { WargamingResponse } from './wargamingResponse.js';

export interface Player {
  nickname: string;
  account_id: number;
}

export type Players = WargamingResponse<Player[]>;
