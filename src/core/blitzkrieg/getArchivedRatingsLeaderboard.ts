import { BlitzkriegRatingsLeaderboard } from '../../../scripts/buildRatingsLeaderboard';
import { Region } from '../../constants/regions';
import { DATABASE_REPO } from './getArchivedRatingsMidnightLeaderboard';
import { octokit } from './octokit';

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

  const { data } = await octokit.repos.getContent({
    ...DATABASE_REPO,
    path: `${region}/ratings/${season}/latest.json`,
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error('Archived ratings data is malformed');
  }

  const response = await fetch(data.download_url!);
  const json = (await response.json()) as BlitzkriegRatingsLeaderboard;

  LEADERBOARD_CACHE[region][season] = json;

  return json;
}
