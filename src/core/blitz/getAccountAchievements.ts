import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchBlitz';
import { normalizeIds } from './normalizeIds';

interface IndividualAccountAchievements {
  achievements: {
    [achievement: string]: number;
  };
  max_series: {
    [achievement: string]: number;
  };
}

export interface AccountAchievements {
  [id: number]: IndividualAccountAchievements;
}

export async function getAccountAchievements<
  Ids extends number | number[],
  ReturnType = Ids extends number
    ? IndividualAccountAchievements
    : IndividualAccountAchievements[],
>(region: Region, ids: Ids) {
  const object = await fetchBlitz<AccountAchievements>(
    `https://api.wotblitz.${region}/wotb/account/achievements/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${normalizeIds(
      ids,
    )}`,
  );

  if (typeof ids === 'number') {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
