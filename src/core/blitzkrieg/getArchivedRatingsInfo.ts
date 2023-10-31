import { RatingsInfo } from '../../commands/ratings';
import { Region } from '../../constants/regions';
import { DATABASE_REPO } from './getArchivedRatingsMidnightLeaderboard';
import { octokit } from './octokit';

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

  const { data } = await octokit.repos.getContent({
    ...DATABASE_REPO,
    path: `${region}/ratings/${season}/info.json`,
  });

  if (Array.isArray(data) || data.type !== 'file')
    throw new Error('Archived ratings info is malformed');

  const content = Buffer.from(data.content, 'base64').toString();
  const jsonContent = JSON.parse(content) as RatingsInfo & {
    detail: undefined;
  };

  INFO_CACHE[region][season] = jsonContent;

  return jsonContent;
}
