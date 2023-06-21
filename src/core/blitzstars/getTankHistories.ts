import { BlitzServer } from '../../constants/servers.js';
import { AllStats } from '../../types/accountInfo.js';
import getTankStats from '../blitz/getTankStats.js';
import { emptyAllStats } from './getTankStatsOverTime.js';

export interface TankHistory {
  all: AllStats;
  last_battle_time: number;
  mark_of_mastery: number;
  battle_life_time: number;
  account_id: number;
  tank_id: number;
}

export const emptyTankHistory: TankHistory = {
  all: emptyAllStats,
  last_battle_time: -Infinity,
  mark_of_mastery: 0,
  battle_life_time: 0,
  account_id: 0,
  tank_id: 0,
};

export type TankHistories = TankHistory[];

export interface GetTankHistoriesOptions {
  start: number;
  end: number;
  includeLatestHistories: boolean;
  includePreviousHistories: boolean;
  tankId?: number;
}

export const getTankHistoriesDefaultOptions: GetTankHistoriesOptions = {
  start: -Infinity,
  end: Infinity,
  includeLatestHistories: false,
  includePreviousHistories: false,
};

export default async function getTankHistories(
  server: BlitzServer,
  id: number,
  options?: Partial<GetTankHistoriesOptions>,
) {
  const mergedOptions = { ...getTankHistoriesDefaultOptions, ...options };
  const tankHistoriesResponse = await fetch(
    `https://www.blitzstars.com/api/tankhistories/for/${id}/`,
  );
  const tankHistories = (await tankHistoriesResponse.json()) as TankHistories;
  const compliantTanks: number[] = [];
  const lastBattles: Record<number, number> = {};
  const lastNonCompliantIndex: Record<number, number> = {};
  const hasCompliedOnce: Record<number, boolean> = {};
  const filtered = tankHistories.filter(
    ({ last_battle_time, tank_id, all: { battles } }, index) => {
      const complies =
        last_battle_time >= mergedOptions.start &&
        last_battle_time <= mergedOptions.end &&
        (mergedOptions.tankId === undefined ||
          tank_id === mergedOptions.tankId);

      if (complies && !hasCompliedOnce[tank_id]) {
        hasCompliedOnce[tank_id] = true;
        compliantTanks.push(tank_id);
      }
      if (!hasCompliedOnce[tank_id]) lastNonCompliantIndex[tank_id] = index;
      lastBattles[tank_id] = battles;

      return complies;
    },
  );

  const latestNodes: TankHistories = [];

  if (mergedOptions.includeLatestHistories) {
    (await getTankStats(server, id)).forEach((tankHistory) => {
      if (
        tankHistory.all.battles > (lastBattles[tankHistory.tank_id] ?? 0) &&
        (mergedOptions.tankId === undefined ||
          tankHistory.tank_id === mergedOptions.tankId)
      ) {
        if (!hasCompliedOnce[tankHistory.tank_id]) {
          // was played today for the first time... I think???
          hasCompliedOnce[tankHistory.tank_id] = true;
          compliantTanks.push(tankHistory.tank_id);
        }
        latestNodes.push(tankHistory);
      }
    });
  }

  const previousNodes: TankHistories = [];

  if (mergedOptions.includePreviousHistories) {
    compliantTanks.forEach((tankId) => {
      if (tankId in lastNonCompliantIndex) {
        previousNodes.push(
          tankHistories[lastNonCompliantIndex[tankId]] ?? {
            ...emptyTankHistory,
            account_id: id,
            tank_id: tankId,
          },
        );
      }
    });
  }

  return [...previousNodes, ...filtered, ...latestNodes];
}
