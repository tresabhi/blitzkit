import { fetchBlitz, Region } from '@blitzkit/core';
import { normalizeIds } from '../../../website/src/core/blitz/normalizeIds';

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
    region,
    'account/achievements',
    { account_id: normalizeIds(ids) },
  );

  if (typeof ids === 'number') {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
