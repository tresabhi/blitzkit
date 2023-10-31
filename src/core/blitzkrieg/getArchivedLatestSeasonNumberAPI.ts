let cachedLatestArchivedSeasonNumber: number | null = null;

/**
 * The first every season that Blitzkrieg tracked :)
 */
export const FIRST_ARCHIVED_RATINGS_SEASON = 49;

export async function getArchivedLatestSeasonNumberAPI() {
  if (cachedLatestArchivedSeasonNumber) {
    return cachedLatestArchivedSeasonNumber;
  }

  const response = await fetch(`/api/ratings/latest-archived-season-number`);
  const number = parseInt(await response.text());
  cachedLatestArchivedSeasonNumber = number;

  return cachedLatestArchivedSeasonNumber;
}
