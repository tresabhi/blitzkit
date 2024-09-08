import { Region } from '@blitzkit/core';
import buttonLink from '../../../../bot/src/core/discord/buttonLink';
import { getAccountInfo } from '../blitz/getAccountInfo';

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
