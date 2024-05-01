import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';

export function authURL(region: Region, callback?: string) {
  return `https://api.worldoftanks.${region}/wot/auth/login/?application_id=${WARGAMING_APPLICATION_ID}&redirect_uri=${encodeURIComponent(
    `${location.origin}/callback/wargaming/${callback ? `?return=${location.href}` : ''}`,
  )}`;
}
