import { fetchBlitz, Region } from '@blitzkit/core';
import { usernamePattern } from './constants';

export interface AccountListItem {
  nickname: string;
  account_id: number;
}
export type AccountList = AccountListItem[];
export type AccountListWithServer = (AccountListItem & {
  region: Region;
})[];

export async function searchPlayersAcrossRegions(search: string, limit = 25) {
  const trimmedSearch = search.trim();
  const normalizedLimit = Math.floor(limit / 3);

  if (usernamePattern.test(trimmedSearch)) {
    return (
      await Promise.all([
        fetchBlitz<AccountList>('com', 'account/list', {
          search,
          limit: normalizedLimit,
        }).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: 'com' as Region,
            })),
        ),
        fetchBlitz<AccountList>('eu', 'account/list', {
          search,
          limit: normalizedLimit,
        }).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: 'eu' as Region,
            })),
        ),
        fetchBlitz<AccountList>('asia', 'account/list', {
          search,
          limit: normalizedLimit,
        }).then(
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

export * from './constants';
