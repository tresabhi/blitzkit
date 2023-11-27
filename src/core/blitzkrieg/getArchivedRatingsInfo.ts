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

export default async function getArchivedRatingsInfo(
  region: Region,
  season: number,
) {
  if (INFO_CACHE[region][season]) {
    return INFO_CACHE[region][season];
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/tresabhi/blitzkrieg-assets/main/${region}/ratings/${season}/info.json`,
  );
  const jsonContent = (await response.json()) as RatingsInfo & {
    detail: undefined;
  };

  INFO_CACHE[region][season] = jsonContent;

  return jsonContent;
}
