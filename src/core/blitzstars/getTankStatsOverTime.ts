import { BlitzServer } from '../../constants/servers.js';
import { AllStats } from '../../types/accountInfo.js';
import { TanksStats } from '../../types/tanksStats.js';
import getWargamingResponse from '../blitz/getWargamingResponse.js';
import { args } from '../process/args.js';

export interface TankHistoryNode {
  all: AllStats;
  last_battle_time: number;
  mark_of_mastery: number;
  battle_life_time: number;
  account_id: number;
  tank_id: number;
}

export const emptyTankHistoryNode: TankHistoryNode = {
  account_id: 0,
  battle_life_time: 0,
  last_battle_time: 0,
  mark_of_mastery: 0,
  tank_id: 0,
  all: {
    battles: 0,
    capture_points: 0,
    damage_dealt: 0,
    damage_received: 0,
    dropped_capture_points: 0,
    frags: 0,
    frags8p: 0,
    hits: 0,
    losses: 0,
    max_frags: 0,
    max_xp: 0,
    shots: 0,
    spotted: 0,
    survived_battles: 0,
    xp: 0,
    win_and_survived: 0,
    wins: 0,
  },
};

export type TankHistory = TankHistoryNode[];

export default async function getTankStatsOverTime(
  server: BlitzServer,
  id: number,
  start = -Infinity,
  end = Infinity,
) {
  const latestTankStatsRaw = await getWargamingResponse<TanksStats>(
    `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
  );
  const tankHistoriesResponse = await fetch(
    `https://www.blitzstars.com/api/tankhistories/for/${id}/`,
  );
  const tankHistories = (await tankHistoriesResponse.json()) as TankHistory;
  const history = [...tankHistories, ...latestTankStatsRaw[id]];

  // sort them even though most won't be used
  const tankSortedHistory: Record<number, TankHistory> = {};
  const tankIds: number[] = [];
  history.forEach((node) => {
    if (!tankSortedHistory[node.tank_id]) {
      tankSortedHistory[node.tank_id] = [node];
      tankIds.push(node.tank_id);
    } else {
      tankSortedHistory[node.tank_id].push(node);
    }
  });

  // find the ones played within the range
  const tankIdsInRange = tankIds.filter((tankId) =>
    tankSortedHistory[tankId].some(
      (node) => node.last_battle_time > start && node.last_battle_time < end,
    ),
  );

  // fetch history node right before "start" and right before "end"
  const tanksBeforeAndAfter: Record<number, AllStats> = {};
  tankIdsInRange.forEach((tankId) => {
    const sortedHistory = tankSortedHistory[tankId];
    const previousIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > start) - 1;
    const latestIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > end) - 1;
    const previous = sortedHistory[previousIndex] ?? emptyTankHistoryNode;
    const latest =
      sortedHistory[latestIndex] ?? sortedHistory[sortedHistory.length - 1];

    function diff(get: (allStats: AllStats) => number) {
      return get(latest.all) - get(previous.all);
    }
    function max(get: (allStats: AllStats) => number) {
      return Math.max(get(latest.all), get(previous.all));
    }

    // check if there was a change in battles as games in ratings do update last_battle_time
    if (diff((a) => a.battles) > 0) {
      tanksBeforeAndAfter[tankId] = {
        battles: diff((a) => a.battles),
        capture_points: diff((a) => a.capture_points),
        damage_dealt: diff((a) => a.damage_dealt),
        damage_received: diff((a) => a.damage_received),
        dropped_capture_points: diff((a) => a.dropped_capture_points),
        frags: diff((a) => a.frags),
        frags8p: diff((a) => a.frags8p),
        hits: diff((a) => a.hits),
        losses: diff((a) => a.losses),
        max_frags: max((a) => a.max_frags),
        max_xp: max((a) => a.max_xp),
        shots: diff((a) => a.shots),
        spotted: diff((a) => a.spotted),
        survived_battles: diff((a) => a.survived_battles),
        win_and_survived: diff((a) => a.win_and_survived),
        wins: diff((a) => a.wins),
        xp: diff((a) => a.xp),
      };
    }
  });

  return tanksBeforeAndAfter;
}
