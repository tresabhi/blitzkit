import { Region } from '@blitzkit/core';
import { getAccountInfo } from '@blitzkit/core/src/blitz/getAccountInfo';
import { buttonLink } from '../discord/buttonLink';

export async function getBlitzStarsLinkButton(
  region: Region,
  id: number,
  tankId?: number,
) {
  const { nickname } = await getAccountInfo(region, id);

  return buttonLink(
    `https://www.blitzstars.com/player/${region}/${nickname}${
      tankId ? `/tank/${tankId!}` : ''
    }`,
    'BlitzStars',
  );
}
