import { DATABASE_REPO } from './getArchivedRatingsMidnightLeaderboard';
import { octokit } from './octokit';

let cachedLatestArchivedSeasonNumber: number | null = null;

export async function getArchivedLatestSeasonNumber() {
  if (cachedLatestArchivedSeasonNumber) {
    return cachedLatestArchivedSeasonNumber;
  }

  const { data } = await octokit.repos.getContent({
    ...DATABASE_REPO,
    path: 'com/ratings',
  });

  if (!Array.isArray(data)) {
    throw new Error('Archived ratings data is malformed');
  }

  cachedLatestArchivedSeasonNumber = Math.max(
    ...data.map(({ name }) => parseInt(name)),
  );

  return cachedLatestArchivedSeasonNumber;
}
