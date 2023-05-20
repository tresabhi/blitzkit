import { BlitzServer } from '../../constants/servers.js';
import { Account, AccountList } from '../../types/accountList.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export type AccountListWithServer = (Account & {
  server: 'com' | 'eu' | 'asia';
})[];

export default async function listAccountsPanServer(search: string, limit = 9) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.round(limit / 3);

  return (
    await Promise.all([
      getWargamingResponse<AccountList>(
        `https://api.wotblitz.com/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            server: 'com' as BlitzServer,
          })),
      ),
      getWargamingResponse<AccountList>(
        `https://api.wotblitz.eu/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
      ).then(
        (value) =>
          value &&
          value.map((account) => ({
            ...account,
            server: 'eu' as BlitzServer,
          })),
      ),
      getWargamingResponse<AccountList>(
        `https://api.wotblitz.asia/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
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
