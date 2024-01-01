import getRatingsInfo from '../blitz/getRatingsInfo';

interface GitHubTrees {
  tree: { path: string; url: string }[];
}

let cachedLatestArchivedSeasonNumber: number | null = null;

export async function getArchivedLatestSeasonNumber() {
  if (cachedLatestArchivedSeasonNumber !== null) {
    return cachedLatestArchivedSeasonNumber;
  }

  const ratingsInfo = await getRatingsInfo('com');

  if (ratingsInfo.detail) {
    const regionsURL = (
      (await fetch(
        'https://api.github.com/repos/tresabhi/blitzkrieg-assets/git/trees/main',
      ).then((response) => response.json())) as GitHubTrees
    ).tree.find(({ path }) => path === 'regions')!.url;
    const comURL = (
      (await fetch(regionsURL).then((response) =>
        response.json(),
      )) as GitHubTrees
    ).tree.find(({ path }) => path === 'com')!.url;
    const ratingsURL = (
      (await fetch(comURL).then((response) => response.json())) as {
        tree: [{ url: string }];
      }
    ).tree[0].url;
    const latestSeason = Math.max(
      ...(
        (await fetch(ratingsURL).then((response) => response.json())) as {
          tree: { path: string }[];
        }
      ).tree.map(({ path }) => Number(path)),
    );

    cachedLatestArchivedSeasonNumber = latestSeason;
  } else {
    cachedLatestArchivedSeasonNumber = ratingsInfo.current_season - 1;
  }

  return cachedLatestArchivedSeasonNumber;
}
