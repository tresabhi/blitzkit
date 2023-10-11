import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { PlayerClanInfo } from '../../types/playerClanData';
import getWargamingResponse from './getWargamingResponse';

export function playerClanInfo(region: Region, id: number) {
  return getWargamingResponse<PlayerClanInfo>(
    `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
  );
}
