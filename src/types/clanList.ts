import { WargamingResponse } from './wargamingResponse.js';

export interface Clan {
  members_count: number;
  created_at: number;
  clan_id: number;
  tag: string;
  name: string;
}

export interface ClanList extends WargamingResponse {
  data: Clan[];
}
