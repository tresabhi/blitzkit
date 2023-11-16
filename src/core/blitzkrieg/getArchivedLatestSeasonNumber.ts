import getRatingsInfo from '../blitz/getRatingsInfo';

let cachedLatestArchivedSeasonNumber: number | null = null;

export async function getArchivedLatestSeasonNumber() {
  const ratingsInfo = await getRatingsInfo('com');

  if (ratingsInfo.detail) {
    const comURL = (
      (await fetch(
        'https://api.github.com/repos/tresabhi/blitzkrieg-db/git/trees/main',
      ).then((response) => response.json())) as {
        tree: { path: string; url: string }[];
      }
    ).tree.find(({ path }) => path === 'com')!.url;
    const ratingsURL = (
      (await fetch(comURL).then((response) => response.json())) as {
        tree: [{ url: string }];
      }
    ).tree[0].url;
    const latestSeason = Math.max(
      ...(
        (await fetch(ratingsURL).then((response) => {
          response.json();
        })) as { tree: { path: string }[] }
      ).tree.map(({ path }) => parseInt(path)),
    );

    return latestSeason;
  } else {
    return ratingsInfo.current_season - 1;
  }
}
