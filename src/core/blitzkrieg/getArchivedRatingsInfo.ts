import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { asset } from './asset';
import { superDecompress } from './superDecompress';

const cache: Record<
  Region,
  Record<
    number,
    RatingsInfo & {
      detail: undefined;
    }
  >
> = {
  com: {},
  eu: {},
  asia: {},
};

export default async function getArchivedRatingsInfo(
  region: Region,
  season: number,
) {
  if (!cache[region][season]) {
    const info = await fetch(
      asset(`regions/${region}/ratings/${season}/info.cdon.lz4`),
    )
      .then((response) => response.arrayBuffer())
      .then((buffer) =>
        superDecompress<RatingsInfo & { detail: undefined }>(
          new Uint8Array(buffer),
        ),
      );
    cache[region][season] = info;
  }

  return cache[region][season];
}
