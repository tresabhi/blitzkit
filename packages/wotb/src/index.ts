import { GameAPI } from '../../wg/src/classes/GameAPI';
import { WGApp } from '../../wg/src/classes/WGApp';
import {
  PlayerPersonalData,
  PlayerPersonalDataParams,
} from './types/playerPersonalData';
import {
  PlayerParams,
  Players,
  PlayersEntry,
  PlayersEntryDefaultFields,
} from './types/players';
import { WOTBAPIConstructorOptions, WOTBRealm } from './types/wotb';
import { resolveParams } from './utils/resolveParams';

export * from './types';

/** World of Tanks Blitz API. */
export class WOTBAPI extends GameAPI implements WOTBAPIConstructorOptions {
  realm: WOTBRealm;

  constructor(app: WGApp, options: WOTBAPIConstructorOptions) {
    super(app, {
      root: `https://api.wotblitz.${options.realm}/wotb/`,
    });

    this.realm = options.realm;
  }

  /**
   * Method returns partial list of players. The list is filtered by initial
   * characters of user name and sorted alphabetically.
   */
  players<
    IncludeFields extends keyof PlayersEntry = PlayersEntryDefaultFields,
    ExcludeFields extends keyof PlayersEntry = never,
  >(
    params: PlayerParams,
    include?: IncludeFields[],
    exclude?: ExcludeFields[],
  ) {
    return this.fetchPath<Players<IncludeFields, ExcludeFields>>(
      'account/list',
      resolveParams(params, include, exclude),
    );
  }

  playerPersonalData(params: PlayerPersonalDataParams) {
    return this.fetchPath<PlayerPersonalData>('account/info', params);
  }
}

const app = new WGApp({ id: Bun.env.WARGAMING_APPLICATION_ID! });
const api = new WOTBAPI(app, { realm: WOTBRealm.NorthAmerica });

console.log(await api.playerPersonalData({ account_id: 1041988373 }));
