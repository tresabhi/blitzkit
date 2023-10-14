import { BlitzkriegRatingsLeaderboard } from '../../../scripts/buildRatingsLeaderboard';
import { Region } from '../../constants/regions';
import { octokit } from '../../LEGACY_core/github/octokit';

export const DATABASE_REPO = { owner: 'tresabhi', repo: 'blitzkrieg-db' };

const MIDNIGHT_LEADERBOARD_CACHE: Record<
  Region,
  Record<number, BlitzkriegRatingsLeaderboard>
> = {
  com: {},
  eu: {},
  asia: {},
};

export default async function getMidnightLeaderboard(
  region: Region,
  season: number,
) {
  if (MIDNIGHT_LEADERBOARD_CACHE[region][season]) {
    return MIDNIGHT_LEADERBOARD_CACHE[region][season];
  }

  try {
    const { data } = await octokit.repos.getContent({
      ...DATABASE_REPO,
      path: `${region}/ratings/${season}/midnight.json`,
    });

    if (!Array.isArray(data) && data.type === 'file') {
      const response = await fetch(data.download_url!);
      const json = (await response.json()) as BlitzkriegRatingsLeaderboard;

      MIDNIGHT_LEADERBOARD_CACHE[region][season] = json;

      return json;
    }
  } catch (error) {
    console.warn(
      `No midnight leaderboard found for season ${season}, region ${region}`,
    );
  }
}
