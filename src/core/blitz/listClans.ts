import { BlitzServer } from '../../constants/servers';
import { Clan, ClanList } from '../../types/clanList';
import { WARGAMING_APPLICATION_ID } from '../node/arguments';
import getWargamingResponse from './getWargamingResponse';

export type ClanListWithServer = (Clan & {
  server: 'com' | 'eu' | 'asia';
})[];

export default async function listClans(search: string, limit = 9) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.round(limit / 3);

  return (
    await Promise.all([
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.com/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            server: 'com' as BlitzServer,
          })),
      ),
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.eu/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            server: 'eu' as BlitzServer,
          })),
      ),
      getWargamingResponse<ClanList>(
        `https://api.wotblitz.asia/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            server: 'asia' as BlitzServer,
          })),
      ),
    ])
  )
    .filter(Boolean)
    .flat();
}
