import { Region } from '../../constants/regions';
import { AllStats } from '../../types/accountInfo';
import getTankHistories, {
  TankHistories,
  TankHistoryRaw,
} from './getTankHistories';

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

// BIG TODO: merge this neatly with diffNormalizedTankStats
export default async function getDiffedTankStats(
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
  const diffed: Record<number, AllStats> = {};
  inRangeTanks.forEach((tankId) => {
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

    // check if there was a change in battles as games in ratings do update last_battle_time
    if (diff((a) => a.battles) > 0) {
      diffed[tankId] = {
        battles: diff((a) => a.battles),
        capture_points: diff((a) => a.capture_points),
        damage_dealt: diff((a) => a.damage_dealt),
        damage_received: diff((a) => a.damage_received),
        dropped_capture_points: diff((a) => a.dropped_capture_points),
        frags: diff((a) => a.frags),
        frags8p: diff((a) => a.frags8p),
        hits: diff((a) => a.hits),
        losses: diff((a) => a.losses),
        max_frags: latest.all.max_frags,
        max_xp: latest.all.max_xp,
        shots: diff((a) => a.shots),
        spotted: diff((a) => a.spotted),
        survived_battles: diff((a) => a.survived_battles),
        win_and_survived: diff((a) => a.win_and_survived),
        wins: diff((a) => a.wins),
        xp: diff((a) => a.xp),
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

  return { diffed, order };
}
