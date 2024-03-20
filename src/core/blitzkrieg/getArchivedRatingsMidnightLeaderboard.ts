import { Region } from '../../constants/regions';
import { BkrlDiscriminatedEntries, BkrlReadStream } from '../streams/bkrl';
import { asset } from './asset';

const cache: Record<Region, Record<number, BkrlDiscriminatedEntries | null>> = {
  com: {},
  eu: {},
  asia: {},
};

export default async function getArchivedRatingsMidnightLeaderboard(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/ratings/${season}/midnight.bkrl`),
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
