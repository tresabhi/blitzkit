import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';

export function authURL(region: Region, callback?: string) {
  if (typeof window === 'undefined') throw new Error('window is undefined');

  return `https://api.worldoftanks.${region}/wot/auth/login/?application_id=${WARGAMING_APPLICATION_ID}&redirect_uri=${encodeURIComponent(
    `${window.location.origin}/callback/wargaming/${callback ? `?return=${location.href}` : ''}`,
  )}`;
}
