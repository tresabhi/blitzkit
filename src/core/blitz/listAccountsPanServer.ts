import { BlitzServer } from '../../constants/servers.js';
import { Account, AccountList } from '../../types/accountList.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export type AccountListWithServer = (Account & {
  server: 'com' | 'eu' | 'asia';
})[];

export default function listAccountsPanServer(search: string, limit = 9) {
  return new Promise<AccountListWithServer>(async (resolve) => {
    const trimmed = search.trim();
    if (trimmed.length < 3 && trimmed.length > 100) resolve([]);

    const normalizedLimit = Math.round(limit / 3);
    const accountList: AccountListWithServer = [];
    let done = 0;

    function afterResponse() {
      done++;

      if (done === 3) {
        resolve(accountList);
      }
    }

    getWargamingResponse<AccountList>(
      `https://api.wotblitz.com/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
    ).then((value) => {
      if (value)
        accountList.push(
          ...value.map((account) => ({
            ...account,
            server: 'com' as BlitzServer,
          })),
        );
      afterResponse();
    });
    getWargamingResponse<AccountList>(
      `https://api.wotblitz.eu/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
    ).then((value) => {
      if (value)
        accountList.push(
          ...value.map((account) => ({
            ...account,
            server: 'eu' as BlitzServer,
          })),
        );
      afterResponse();
    });
    getWargamingResponse<AccountList>(
      `https://api.wotblitz.asia/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
    ).then((value) => {
      if (value)
        accountList.push(
          ...value.map((account) => ({
            ...account,
            server: 'asia' as BlitzServer,
          })),
        );
      afterResponse();
    });
  });
}
