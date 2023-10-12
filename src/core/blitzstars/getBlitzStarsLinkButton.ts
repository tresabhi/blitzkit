import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { AccountInfo } from '../../types/accountInfo';
import getWargamingResponse from '../blitz/getWargamingResponse';
import linkButton from '../discord/linkButton';

export async function getBlitzStarsLinkButton(
  region: Region,
  id: number,
  tankId?: number,
) {
  const { nickname } = (
    await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    )
  )[id];

  return linkButton(
    `https://www.blitzstars.com/player/${region}/${nickname}${
      tankId ? `/tank/${tankId!}` : ''
    }`,
    'BlitzStars',
  );
}
