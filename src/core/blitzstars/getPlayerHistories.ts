import { BlitzServer } from '../../constants/servers.js';
import { AccountInfo, AllStats } from '../../types/accountInfo.js';
import {
  GetHistoriesOptions,
  Histories,
  History,
  getHistoriesDefaultOptions,
} from '../../types/histories.js';
import getWargamingResponse from '../blitz/getWargamingResponse.js';
import { WARGAMING_APPLICATION_ID } from '../node/arguments.js';
import { emptyAllStats } from './getTankStatsDiffed.js';

export interface PlayerHistoryRaw {
  clan: { clan_id: number; name: string; tag: string };
  statistics: {
    all: AllStats;
    wn8: number;
    wn7: number;
    average_tier: number;
  };
  last_battle_time: number;
  nickname: string;
  account_id: number;
  achievements: {
    account_id: number;
    [key: string]: number;
  };
  region: BlitzServer;
}

export type PlayerHistoriesRaw = PlayerHistoryRaw[];

export default async function getPlayerHistories(
  server: BlitzServer,
  id: number,
  options?: Partial<GetHistoriesOptions>,
) {
  const mergedOptions = { ...getHistoriesDefaultOptions, ...options };
  const response = await fetch(
    `https://www.blitzstars.com/api/playerstats/${id}`,
  );
  const playerHistories = ((await response.json()) as PlayerHistoriesRaw).map(
    (history) =>
      ({
        all: history.statistics.all,
        last_battle_time: history.last_battle_time,
      } satisfies History),
  );
  let lastNonCompliantIndex = -1;
  let hasCompliedOnce = false;
  const filtered = playerHistories.filter(({ last_battle_time }, index) => {
    const complies =
      last_battle_time >= mergedOptions.start &&
      last_battle_time <= mergedOptions.end;

    if (complies && !hasCompliedOnce) hasCompliedOnce = true;
    if (!hasCompliedOnce) lastNonCompliantIndex = index;

    return complies;
  });

  const latestNodes: Histories = [];

  if (mergedOptions.includeLatestHistories) {
    const {
      last_battle_time,
      statistics: { all },
    } = (
      await getWargamingResponse<AccountInfo>(
        `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
      )
    )[id];

    latestNodes.push({ all, last_battle_time });
  }

  const previousNodes: Histories = [];

  if (mergedOptions.includePreviousHistories) {
    if (lastNonCompliantIndex !== -1) {
      previousNodes.push(
        playerHistories[lastNonCompliantIndex] ??
          ({
            all: emptyAllStats,
            last_battle_time: -Infinity,
          } satisfies History),
      );
    }
  }

  return [...latestNodes, ...filtered, ...previousNodes] satisfies Histories;
}
