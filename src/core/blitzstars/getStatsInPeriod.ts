import { Region } from '../../constants/regions';
import { AllStats } from '../blitz/getAccountInfo';
import getTankHistories, {
  TankHistories,
  TankHistoryRaw,
} from '../blitzkrieg/getTankHistories';

export const emptyAllStats: AllStats = {
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
};

export const emptyTankHistoryNode: TankHistoryRaw = {
  account_id: 0,
  battle_life_time: 0,
  last_battle_time: 0,
  mark_of_mastery: 0,
  tank_id: 0,
  all: emptyAllStats,
};

export interface DiffedTankStats {
  diff: Record<number, AllStats>;
  order: number[];
}

// BIG TODO: merge this neatly with diffNormalizedTankStats
export default async function getStatsInPeriod(
  server: Region,
  id: number,
  start: number,
  end: number,
) {
  const history = await getTankHistories(server, id, {
    includeLatestHistories: true,
  });

  // sort them even though most won't be used
  const tankSortedHistory: Record<number, TankHistories> = {};
  const tanks: number[] = [];
  history.forEach((node) => {
    if (!tankSortedHistory[node.tank_id]) {
      tankSortedHistory[node.tank_id] = [node];
      tanks.push(node.tank_id);
    } else {
      tankSortedHistory[node.tank_id].push(node);
    }
  });

  // find the ones played within the range
  const inRangeTanks = tanks.filter((tankId) =>
    tankSortedHistory[tankId].some(
      (node) => node.last_battle_time > start && node.last_battle_time < end,
    ),
  );
  const playedTanks: number[] = [];

  // fetch history node right before "start" and right before "end"
  const diff: Record<number, AllStats> = {};
  inRangeTanks.forEach((tankId) => {
    const sortedHistory = tankSortedHistory[tankId];
    const previousIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > start) - 1;
    const latestIndex =
      sortedHistory.findIndex((node) => node.last_battle_time > end) - 1;
    const previous = sortedHistory[previousIndex] ?? emptyTankHistoryNode;
    const latest =
      sortedHistory[latestIndex] ?? sortedHistory[sortedHistory.length - 1];

    function d(get: (allStats: AllStats) => number) {
      return get(latest.all) - get(previous.all);
    }

    // check if there was a change in battles as games in ratings do update last_battle_time
    if (d((a) => a.battles) > 0) {
      diff[tankId] = {
        battles: d((a) => a.battles),
        capture_points: d((a) => a.capture_points),
        damage_dealt: d((a) => a.damage_dealt),
        damage_received: d((a) => a.damage_received),
        dropped_capture_points: d((a) => a.dropped_capture_points),
        frags: d((a) => a.frags),
        frags8p: d((a) => a.frags8p),
        hits: d((a) => a.hits),
        losses: d((a) => a.losses),
        max_frags: latest.all.max_frags,
        max_xp: latest.all.max_xp,
        shots: d((a) => a.shots),
        spotted: d((a) => a.spotted),
        survived_battles: d((a) => a.survived_battles),
        win_and_survived: d((a) => a.win_and_survived),
        wins: d((a) => a.wins),
        xp: d((a) => a.xp),
      };

      playedTanks.push(tankId);
    }
  });

  const order = playedTanks.sort((a, b) => {
    const aHistories = tankSortedHistory[a];
    const bHistories = tankSortedHistory[b];
    const aLatest = aHistories[aHistories.length - 1];
    const bLatest = bHistories[bHistories.length - 1];

    return bLatest.last_battle_time - aLatest.last_battle_time;
  });

  return { diff, order } satisfies DiffedTankStats;
}
