import { WargamingResponse } from './wargamingResponse.js';

export interface ClanDetailsData {
  recruiting_options: {
    vehicles_level: number;
    wins_ratio: number;
    average_battles_per_day: number;
    battles: number;
    average_damage: number;
  };
  members_count: number;
  name: string;
  creator_name: string;
  clan_id: number;
  created_at: number;
  updated_at: number;
  leader_name: string;
  members_ids: number[];
  recruiting_policy: string;
  tag: string;
  is_clan_disbanded: boolean;
  old_name: string;
  emblem_set_id: number;
  creator_id: number;
  motto: string;
  renamed_at: number;
  old_tag: null;
  leader_id: number;
  description: string;
}

export type ClanDetails = WargamingResponse<{
  [accountId: number]: ClanDetailsData;
}>;
