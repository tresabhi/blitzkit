import {
  asset,
  BkrlDiscriminatedEntries,
  BkrlReadStream,
  Region,
} from '@blitzkit/core';

const cache: Record<Region, Record<number, BkrlDiscriminatedEntries>> = {
  asia: {},
  eu: {},
  com: {},
};

export async function getArchivedRatingLeaderboard(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/rating/${season}/latest.bkrl`),
    )
      .then((response) => response.arrayBuffer())
      .then((buffer) => new BkrlReadStream(buffer).bkrl());
    cache[region][season] = info;
  }

  return cache[region][season];
}
