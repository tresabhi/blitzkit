import linkButton from '../../LEGACY_core/discord/linkButton';
import { Region } from '../../constants/regions';
import { getAccountInfo } from '../blitz/getAccountInfo';

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
