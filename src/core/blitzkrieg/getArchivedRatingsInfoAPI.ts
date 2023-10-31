import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';

const INFO_CACHE: Record<
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

export default async function getArchivedRatingsInfoAPI(
  region: Region,
  season: number,
) {
  if (INFO_CACHE[region][season]) {
    return INFO_CACHE[region][season];
  }

  const response = await fetch(
    `/api/ratings/archives/${region}/${season}/info`,
  );
  const json = (await response.json()) as RatingsInfo;

  if (json.detail) {
    throw new Error(
      `No ratings info found for season ${season}, region ${region}`,
    );
  }

  INFO_CACHE[region][season] = json;

  return json;
}
