import { assertSecret } from '@blitzkit/core';
import getRatingInfo from '../blitz/getRatingInfo';

interface GitHubTrees {
  tree: { path: string; url: string }[];
}

let cachedLatestArchivedSeasonNumber: number | null = null;

export async function getArchivedLatestSeasonNumber() {
  if (cachedLatestArchivedSeasonNumber !== null) {
    return cachedLatestArchivedSeasonNumber;
  }

  const ratingInfo = await getRatingInfo('com');

  if (ratingInfo.detail) {
    const regionsURL = (
      (await fetch(
        `https://api.github.com/repos/tresabhi/${assertSecret(
          process.env.NEXT_PUBLIC_ASSET_REPO,
        )}/git/trees/main`,
      ).then((response) => response.json())) as GitHubTrees
    ).tree.find(({ path }) => path === 'regions')!.url;
    const comURL = (
      (await fetch(regionsURL).then((response) =>
        response.json(),
      )) as GitHubTrees
    ).tree.find(({ path }) => path === 'com')!.url;
    const ratingURL = (
      (await fetch(comURL).then((response) => response.json())) as {
        tree: [{ url: string }];
      }
    ).tree[0].url;
    const latestSeason = Math.max(
      ...(
        (await fetch(ratingURL).then((response) => response.json())) as {
          tree: { path: string }[];
        }
      ).tree.map(({ path }) => Number(path)),
    );

    cachedLatestArchivedSeasonNumber = latestSeason;
  } else {
    cachedLatestArchivedSeasonNumber = ratingInfo.current_season - 1;
  }

  return cachedLatestArchivedSeasonNumber;
}
