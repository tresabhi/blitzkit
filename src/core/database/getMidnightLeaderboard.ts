import { BlitzkriegRatingsLeaderboard } from '../../../scripts/buildRatingsLeaderboard';
import { Region } from '../../constants/regions';
import { octokit } from '../express/octokit';

export const DATABASE_REPO = { owner: 'tresabhi', repo: 'blitzkrieg-db' };

export default async function getMidnightLeaderboard(
  region: Region,
  season: number,
) {
  try {
    const { data } = await octokit.repos.getContent({
      ...DATABASE_REPO,
      path: `${region}/ratings/${season}/midnight.json`,
    });

    if (!Array.isArray(data) && data.type === 'file') {
      const response = await fetch(data.download_url!);

      return (await response.json()) as BlitzkriegRatingsLeaderboard;
    }
  } catch (error) {
    console.warn(
      `No midnight leaderboard found for season ${season}, region ${region}`,
    );
  }
}
