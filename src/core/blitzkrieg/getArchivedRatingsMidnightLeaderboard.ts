import { BlitzkriegRatingsLeaderboard } from '../../../scripts/buildRatingsLeaderboard';
import { Region } from '../../constants/regions';

export const DATABASE_REPO = { owner: 'tresabhi', repo: 'blitzkrieg-assets' };

const MIDNIGHT_LEADERBOARD_CACHE: Record<
  Region,
  Record<number, BlitzkriegRatingsLeaderboard>
> = {
  com: {},
  eu: {},
  asia: {},
};

export default async function getArchivedRatingsMidnightLeaderboard(
  region: Region,
  season: number,
) {
  if (MIDNIGHT_LEADERBOARD_CACHE[region][season]) {
    return MIDNIGHT_LEADERBOARD_CACHE[region][season];
  }

  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/tresabhi/blitzkrieg-assets/main/${region}/ratings/${season}/midnight.json`,
    );
    const json = (await response.json()) as BlitzkriegRatingsLeaderboard;
    MIDNIGHT_LEADERBOARD_CACHE[region][season] = json;

    return json;
  } catch (error) {
    console.warn(
      `No midnight leaderboard found for season ${season}, region ${region}`,
    );
  }
}
