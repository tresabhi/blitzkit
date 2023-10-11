import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { AccountInfo } from '../../types/accountInfo';
import getWargamingResponse from './getWargamingResponse';

// BIG TODO: generalize all get wargaming calls
export function getAccountInfo(region: Region, id: number) {
  return getWargamingResponse<AccountInfo>(
    `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );
}
