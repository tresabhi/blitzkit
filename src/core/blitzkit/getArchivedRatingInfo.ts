import { RatingInfo } from '../../commands/ratingLeaderboard';
import { Region } from '../../constants/regions';
import { asset } from './asset';
import { superDecompress } from './superDecompress';

const cache: Record<
  Region,
  Record<
    number,
    RatingInfo & {
      detail: undefined;
    }
  >
> = {
  com: {},
  eu: {},
  asia: {},
};

export default async function getArchivedRatingInfo(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/rating/${season}/info.cdon.lz4`),
    )
      .then((response) => response.arrayBuffer())
      .then((buffer) =>
        superDecompress<RatingInfo & { detail: undefined }>(buffer),
      );
    cache[region][season] = info;
  }

  return cache[region][season];
}
