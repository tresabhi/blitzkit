import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchWargaming';
import { normalizeIds } from './normalizeIds';

export interface IndividualClanInfo {
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

export interface ClanInfo {
  [clanId: number]: IndividualClanInfo;
}

export async function getClanInfo<
  Ids extends number | number[],
  ReturnType = Ids extends number ? IndividualClanInfo : IndividualClanInfo[],
>(region: Region, ids: Ids) {
  const object = await fetchBlitz<ClanInfo>(
    `https://api.wotblitz.${region}/wotb/clans/info/?application_id=${WARGAMING_APPLICATION_ID}&clan_id=${normalizeIds(
      ids,
    )}`,
  );

  if (typeof ids === 'number') {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
