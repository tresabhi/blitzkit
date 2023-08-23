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
      const content = Buffer.from(data.content, 'base64').toString();
      const jsonContent = JSON.parse(content) as BlitzkriegRatingsLeaderboard;

      return jsonContent;
    }
  } catch (error) {
    console.warn('No midnight leaderboard found');
  }
}
