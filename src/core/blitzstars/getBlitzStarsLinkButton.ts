import { getAccountInfo } from '../../_core/blitz/getAccountInfo';
import { Region } from '../../constants/regions';
import linkButton from '../discord/linkButton';

export async function getBlitzStarsLinkButton(
  region: Region,
  id: number,
  tankId?: number,
) {
  const { nickname } = await getAccountInfo(region, id);

  return linkButton(
    `https://www.blitzstars.com/player/${region}/${nickname}${
      tankId ? `/tank/${tankId!}` : ''
    }`,
    'BlitzStars',
  );
}
