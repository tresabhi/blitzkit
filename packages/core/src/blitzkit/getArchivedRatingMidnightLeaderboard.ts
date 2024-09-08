import {
  asset,
  BkrlDiscriminatedEntries,
  BkrlReadStream,
  Region,
} from '@blitzkit/core';

const cache: Record<Region, Record<number, BkrlDiscriminatedEntries | null>> = {
  com: {},
  eu: {},
  asia: {},
};

export async function getArchivedRatingMidnightLeaderboard(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/rating/${season}/midnight.bkrl`),
    )
      .then((response) =>
        response.status === 404 ? null : response.arrayBuffer(),
      )
      .then((buffer) =>
        buffer === null ? null : new BkrlReadStream(buffer).bkrl(),
      );
    cache[region][season] = info;
  }

  return cache[region][season];
}
