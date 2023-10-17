import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchWargaming';
import { normalizeExtra } from './normalizeExtra';
import { normalizeIds } from './normalizeIds';

export type IndividualClanAccountInfo = {
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

export interface ClanAccountInfo {
  [accountId: number]: IndividualClanAccountInfo;
}

export async function getClanAccountInfo<
  Ids extends number | number[],
  ReturnType = Ids extends number
    ? IndividualClanAccountInfo
    : IndividualClanAccountInfo[],
>(region: Region, ids: Ids, extra?: string[]) {
  const object = await fetchBlitz<ClanAccountInfo>(
    `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${normalizeIds(
      ids,
    )}${normalizeExtra(extra)}`,
  );

  if (typeof ids === 'number') {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
