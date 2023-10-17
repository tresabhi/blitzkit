import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchWargaming';
import { normalizeIds } from './normalizeIds';

export interface AllStats {
  spotted: number;
  hits: number;
  frags: number;
  max_xp: number;
  wins: number;
  losses: number;
  capture_points: number;
  battles: number;
  damage_dealt: number;
  damage_received: number;
  max_frags: number;
  shots: number;
  frags8p: number;
  xp: number;
  win_and_survived: number;
  survived_battles: number;
  dropped_capture_points: number;
}

export interface SupplementaryStats {
  // if undefined, WN8 is not available for tanks without averages
  WN8?: number;
  tier?: number;
}

export interface ClanStats {
  spotted: number;
  max_frags_tank_id: number;
  hits: number;
  frags: number;
  max_xp: number;
  max_xp_tank_id: number;
  wins: number;
  losses: number;
  capture_points: number;
  battles: number;
  damage_dealt: number;
  damage_received: number;
  max_frags: number;
  shots: number;
  frags8p: number;
  xp: number;
  win_and_survived: number;
  survived_battles: number;
  dropped_capture_points: number;
}

interface IndividualAccountInfo {
  account_id: number;
  created_at: number;
  updated_at: number;
  private: null;
  last_battle_time: number;
  nickname: string;
  statistics: {
    all: AllStats;
    clan: ClanStats;
    frags: null | number;
  };
}

export interface AccountInfo {
  [accountId: number]: IndividualAccountInfo;
}

export async function getAccountInfo<
  Ids extends number | number[],
  ReturnType = Ids extends number
    ? IndividualAccountInfo
    : IndividualAccountInfo[],
>(region: Region, ids: Ids) {
  const object = await fetchBlitz<AccountInfo>(
    `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${normalizeIds(
      ids,
    )}`,
  );

  if (typeof ids === 'number') {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
