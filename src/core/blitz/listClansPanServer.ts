import { BlitzServer } from '../../constants/servers.js';
import { Clan, ClanList } from '../../types/clanList.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export type ClanListWithServer = (Clan & {
  server: 'com' | 'eu' | 'asia';
})[];

export default function listClansPanServer(search: string, limit = 9) {
  return new Promise<ClanListWithServer>(async (resolve) => {
    const trimmed = search.trim();
    if (trimmed.length < 3 && trimmed.length > 100) resolve([]);

    const normalizedLimit = Math.round(limit / 3);
    const accountList: ClanListWithServer = [];
    let done = 0;

    function afterResponse() {
      done++;

      if (done === 3) {
        resolve(accountList);
      }
    }

    getWargamingResponse<ClanList>(
      `https://api.wotblitz.com/wotb/clans/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
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
    getWargamingResponse<ClanList>(
      `https://api.wotblitz.eu/wotb/clans/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
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
    getWargamingResponse<ClanList>(
      `https://api.wotblitz.asia/wotb/clans/list/?application_id=${args['wargaming-application-id']}&search=${search}&limit=${normalizedLimit}`,
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
