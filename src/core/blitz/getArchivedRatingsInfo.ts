import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { DATABASE_REPO } from '../database/getMidnightLeaderboard';
import { octokit } from '../github/octokit';
import throwError from '../node/throwError';

export default async function getArchivedRatingsInfo(
  season: number,
  region: Region,
) {
  const { data } = await octokit.repos.getContent({
    ...DATABASE_REPO,
    path: `${region}/ratings/${season}/info.json`,
  });

  if (Array.isArray(data) || data.type !== 'file')
    throw throwError('Archived ratings info is malformed');

  const content = Buffer.from(data.content, 'base64').toString();
  const jsonContent = JSON.parse(content) as RatingsInfo & {
    detail: undefined;
  };

  return jsonContent;
}
