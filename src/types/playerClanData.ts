export type PlayerClanInfo = {
  [accountId: number]: {
    account_id: number;
    joined_at: number;
    clan_id: number;
    role: string;
    account_name: string;

    clan?: {
      members_count: number;
      name: string;
      created_at: number;
      tag: string;
      clan_id: number;
      emblem_set_id: number;
    };
  } | null;
};
