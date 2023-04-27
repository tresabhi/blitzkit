export interface Clan {
  members_count: number;
  created_at: number;
  clan_id: number;
  tag: string;
  name: string;
}

export type ClanList = Clan[];
