import { GameAPI } from '../../wg/src/classes/GameAPI';
import { WGApp } from '../../wg/src/classes/WGApp';
import { WOTBRealm } from './enums/wotb';
import {
  PlayerParams,
  Players,
  PlayersEntryBase,
  PlayersEntryDefaultFields,
} from './types/players';
import { WOTBAPIConstructorOptions } from './types/wotb';
import { resolveIncludeField } from './utils/resolveIncludeField';

export * from './enums';
export * from './types';

/**
 * World of Tanks Blitz API.
 */
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
    IncludeFields extends keyof PlayersEntryBase = PlayersEntryDefaultFields,
    ExcludeFields extends keyof PlayersEntryBase = never,
  >(
    params: PlayerParams,
    include?: IncludeFields[],
    exclude?: ExcludeFields[],
  ) {
    return this.fetchPath<Players<IncludeFields, ExcludeFields>>(
      'account/list',
      { fields: resolveIncludeField(include, exclude), ...params },
    );
  }
}

const test = new WOTBAPI(new WGApp({ id: Bun.env.WARGAMING_APPLICATION_ID! }), {
  realm: WOTBRealm.NorthAmerica,
});

const a = await test.players();

console.log(a);
