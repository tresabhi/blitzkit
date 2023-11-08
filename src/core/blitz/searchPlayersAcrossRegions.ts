import { Region } from '../../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../../constants/wargamingApplicationID';
import fetchBlitz from './fetchBlitz';

export interface AccountListItem {
  nickname: string;
  account_id: number;
}
export type AccountList = AccountListItem[];
export type AccountListWithServer = (AccountListItem & {
  region: Region;
})[];

export const usernamePattern = /^[a-zA-Z0-9_]{3,24}$/;
export const usernamePatternWithoutPosition = /[a-zA-Z0-9_]{3,24}/;

export default async function searchPlayersAcrossRegions(
  search: string,
  limit = 25,
) {
  const trimmedSearch = search.trim();
  const normalizedLimit = Math.floor(limit / 3);
  const encodedSearch = encodeURIComponent(trimmedSearch);

  if (usernamePattern.test(trimmedSearch)) {
    return (
      await Promise.all([
        fetchBlitz<AccountList>(
          `https://api.wotblitz.com/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}&limit=${normalizedLimit}`,
        ).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: 'com' as Region,
            })),
        ),
        fetchBlitz<AccountList>(
          `https://api.wotblitz.eu/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}&limit=${normalizedLimit}`,
        ).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: 'eu' as Region,
            })),
        ),
        fetchBlitz<AccountList>(
          `https://api.wotblitz.asia/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodedSearch}&limit=${normalizedLimit}`,
        ).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: 'asia' as Region,
            })),
        ),
      ])
    )
      .filter(Boolean)
      .flat() as AccountListWithServer;
  } else {
    return [] as AccountListWithServer;
  }
}
