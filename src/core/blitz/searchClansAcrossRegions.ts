import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import { Clan, ClanList } from '../../types/clanList';
import fetchBlitz from './fetchBlitz';

export type ClanListWithRegion = (Clan & {
  region: 'com' | 'eu' | 'asia';
})[];

export default async function searchClansAcrossRegions(
  search: string,
  limit = 25,
) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.floor(limit / 3);

  // TODO: remove splice once wargaming fixes the functionality of the limit felid

  return (
    await Promise.all([
      fetchBlitz<ClanList>(
        `https://api.wotblitz.com/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: 'com' as Region,
          }))
          .splice(0, normalizedLimit),
      ),
      fetchBlitz<ClanList>(
        `https://api.wotblitz.eu/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: 'eu' as Region,
          }))
          .splice(0, normalizedLimit),
      ),
      fetchBlitz<ClanList>(
        `https://api.wotblitz.asia/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${search}&limit=${normalizedLimit}`,
      ).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: 'asia' as Region,
          }))
          .splice(0, normalizedLimit),
      ),
    ])
  )
    .filter(Boolean)
    .flat();
}
