import { Region } from '../../constants/regions';
import { BkrlDiscriminatedEntries, BkrlReadStream } from '../streams/bkrl';
import { asset } from './asset';

const cache: Record<Region, Record<number, BkrlDiscriminatedEntries>> = {
  asia: {},
  eu: {},
  com: {},
};

export async function getArchivedRatingsLeaderboard(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/ratings/${season}/latest.bkrl`),
    )
      .then((response) => response.arrayBuffer())
      .then((buffer) => new BkrlReadStream(buffer).bkrl());
    cache[region][season] = info;
  }

  return cache[region][season];
}
