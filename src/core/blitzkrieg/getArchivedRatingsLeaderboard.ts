import { BlitzkriegRatingsLeaderboard } from '../../../scripts/buildRatingsLeaderboard';
import { Region } from '../../constants/regions';

const LEADERBOARD_CACHE: Record<
  Region,
  Record<number, BlitzkriegRatingsLeaderboard>
> = {
  asia: {},
  eu: {},
  com: {},
};

export async function getArchivedRatingsLeaderboard(
  region: Region,
  season: number,
) {
  if (LEADERBOARD_CACHE[region][season]) {
    return LEADERBOARD_CACHE[region][season];
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/tresabhi/blitzkrieg-assets/main/regions/${region}/ratings/${season}/latest.json`,
  );
  const json = (await response.json()) as BlitzkriegRatingsLeaderboard;
  LEADERBOARD_CACHE[region][season] = json;

  return json;
}
