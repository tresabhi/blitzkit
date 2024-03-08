'use client';

import { ContextMenu } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import * as Breakdown from '../../../components/Breakdown';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import fetchBlitz from '../../../core/blitz/fetchBlitz';
import {
  TankDefinition,
  tankDefinitions,
} from '../../../core/blitzkrieg/tankDefinitions';
import { tankAverages } from '../../../core/blitzstars/tankAverages';
import calculateWN8 from '../../../core/statistics/calculateWN8';
import { deltaTankStats } from '../../../core/statistics/deltaTankStats';
import getWN8Percentile from '../../../core/statistics/getWN8Percentile';
import mutateSession, {
  resetSession,
  useSession,
} from '../../../stores/session';
import { IndividualTankStats, TanksStats } from '../../../types/tanksStats';
import { CustomColumnDisplay } from '../../tools/session/components/CustomColumn';
import { Menu } from '../../tools/session/components/Menu';

const REFRESH_RATE = 1 / 5;

interface SessionPageProps {
  naked?: boolean;
}

export default function SessionPage({ naked = true }: SessionPageProps) {
  const session = useSession();
  const since = session.isTracking ? new Date(session.time) : undefined;
  const [diff, setDiff] = useState<
    | {
        careerWN8: number;

        list: {
          stats: IndividualTankStats;
          tankDefinitions?: TankDefinition;
          career: IndividualTankStats;
          currentWN8?: number;
          careerWN8?: number;
        }[];
      }
    | undefined
  >(undefined);
  const sessionBattles = diff?.list.reduce(
    (accumulator, { stats }) => accumulator + stats.all.battles,
    0,
  );
  const tankStatsArray = session.isTracking
    ? (Object.values(session.tankStats) as IndividualTankStats[])
    : [];
  const sessionWinrate = diff
    ? diff.list.reduce(
        (accumulator, { stats }) => accumulator + stats.all.wins,
        0,
      ) / sessionBattles!
    : 0;
  const careerBattles = tankStatsArray.reduce(
    (accumulator, stats) => accumulator + stats.all.battles,
    0,
  );
  const careerWinrate =
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.wins,
      0,
    ) / careerBattles;
  const currentDamage = diff
    ? diff.list.reduce(
        (accumulator, { stats }) => accumulator + stats.all.damage_dealt,
        0,
      ) / sessionBattles!
    : 0;
  const careerDamage =
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.damage_dealt,
      0,
    ) / careerBattles;

  useEffect(() => {
    if (session.title === 'Untitled session') {
      mutateSession((draft) => {
        if (draft.isTracking) draft.title = draft.nickname;
      });
    }
  }, [session.title]);

  useEffect(() => {
    async function recalculateDiff() {
      if (session.isTracking) {
        const { id, region } = session;
        const careerRaw = await fetchBlitz<TanksStats>(
          `https://api.wotblitz.${region}/wotb/tanks/stats/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
        );
        const career = careerRaw[id].reduce<
          Record<number, IndividualTankStats>
        >(
          (accumulator, curr) => ({
            ...accumulator,
            [curr.tank_id]: curr,
          }),
          {},
        );
        const awaitedTankDefinitions = await tankDefinitions;
        const awaitedTankAverages = await tankAverages;
        const careerWN8 =
          careerRaw[id].reduce(
            (accumulator, { tank_id, all }) =>
              accumulator +
              (awaitedTankAverages[tank_id] && all.battles > 0
                ? all.battles *
                  calculateWN8(awaitedTankAverages[tank_id].all, all)
                : 0),
            0,
          ) /
          careerRaw[id].reduce(
            (accumulator, { tank_id, all }) =>
              accumulator +
              (awaitedTankAverages[tank_id] && all.battles > 0
                ? all.battles
                : 0),
            0,
          );

        setDiff({
          careerWN8,

          list: (
            Object.values(
              deltaTankStats(session.tankStats, career, session.time / 1000),
            ) as IndividualTankStats[]
          ).map((stats) => {
            return {
              stats,
              tankDefinitions: awaitedTankDefinitions[stats.tank_id],
              career: career[stats.tank_id],
              currentWN8: awaitedTankAverages[stats.tank_id]
                ? calculateWN8(
                    awaitedTankAverages[stats.tank_id].all,
                    stats.all,
                  )
                : undefined,
              careerWN8: awaitedTankAverages[stats.tank_id]
                ? calculateWN8(
                    awaitedTankAverages[stats.tank_id].all,
                    career[stats.tank_id].all,
                  )
                : undefined,
            };
          }),
        });
      }
    }

    recalculateDiff();
    const interval = setInterval(recalculateDiff, 1000 / REFRESH_RATE);

    return () => clearInterval(interval);
  }, [session]);

  const totalRowStats: Record<
    CustomColumnDisplay,
    Breakdown.RowStatItem | undefined
  > = {
    battles: {
      title: 'Battles',
      current: sessionBattles?.toLocaleString(),
      career: tankStatsArray
        .reduce((accumulator, stats) => accumulator + stats.all.battles, 0)
        .toLocaleString(),
    },
    winrate: {
      title: 'Winrate',
      current: sessionBattles ? `${(100 * sessionWinrate).toFixed(2)}%` : '--',
      career: `${(100 * careerWinrate).toFixed(2)}%`,
      delta: sessionBattles === 0 ? 0 : sessionWinrate - careerWinrate,
    },
    wn8: (() => {
      if (!diff) return undefined;

      const battlesWithWN8 = diff.list.reduce(
        (accumulator, { currentWN8, stats }) =>
          (currentWN8 === undefined ? 0 : stats.all.battles) + accumulator,
        0,
      );
      const currentWN8 =
        diff.list.reduce(
          (accumulator, { currentWN8, stats }) =>
            stats.all.battles * (currentWN8 ?? 0) + accumulator,
          0,
        ) / battlesWithWN8!;

      return {
        title: 'WN8',
        current: battlesWithWN8
          ? Math.round(currentWN8!).toLocaleString()
          : '--',
        percentile: battlesWithWN8 ? getWN8Percentile(currentWN8!) : undefined,
        career: Math.round(diff.careerWN8).toLocaleString(),
      };
    })(),
    damage: {
      title: 'Damage',
      delta: sessionBattles === 0 ? 0 : currentDamage - careerDamage,
      current: sessionBattles
        ? Math.round(currentDamage).toLocaleString()
        : '--',
      career: Math.round(careerDamage).toLocaleString(),
    },
    none: undefined,
  };

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div>
          <Breakdown.Root>
            {session.showTotal &&
              session.isTracking &&
              since !== undefined &&
              diff !== undefined && (
                <Breakdown.Row
                  naked={naked}
                  color={session.color}
                  minimized={!session.showCareer}
                  title={session.title}
                  stats={session.customColumns.map((customColumn) => {
                    const rowStat = totalRowStats[customColumn.display];

                    if (!rowStat) return undefined;

                    return {
                      ...rowStat,
                      delta:
                        customColumn.showDelta &&
                        rowStat.percentile === undefined
                          ? rowStat.delta
                          : undefined,
                    };
                  })}
                />
              )}

            {diff?.list
              .sort(
                (a, b) => b.stats.last_battle_time - a.stats.last_battle_time,
              )
              .map(
                ({ stats, tankDefinitions, career, careerWN8, currentWN8 }) => {
                  const rowStats: Record<
                    CustomColumnDisplay,
                    Breakdown.RowStatItem | undefined
                  > = {
                    battles: {
                      title: 'Battles',
                      current: stats.all.battles.toLocaleString(),
                      career: career.all.battles.toLocaleString(),
                    },
                    winrate: {
                      title: 'Winrate',
                      current: `${(
                        100 *
                        (stats.all.wins / stats.all.battles)
                      ).toFixed(2)}%`,
                      career: `${(
                        100 *
                        (career.all.wins / career.all.battles)
                      ).toFixed(2)}%`,
                      delta:
                        stats.all.wins / stats.all.battles -
                        career.all.wins / career.all.battles,
                    },
                    wn8: {
                      title: 'WN8',
                      current:
                        currentWN8 === undefined
                          ? undefined
                          : Math.round(currentWN8).toLocaleString(),
                      career:
                        careerWN8 === undefined
                          ? undefined
                          : Math.round(careerWN8).toLocaleString(),
                      percentile:
                        currentWN8 === undefined
                          ? undefined
                          : getWN8Percentile(currentWN8),
                    },
                    damage: {
                      title: 'Damage',
                      current: Math.round(
                        stats.all.damage_dealt / stats.all.battles,
                      ).toLocaleString(),
                      career: Math.round(
                        career.all.damage_dealt / career.all.battles,
                      ).toLocaleString(),
                      delta:
                        stats.all.damage_dealt / stats.all.battles -
                        career.all.damage_dealt / career.all.battles,
                    },
                    none: undefined,
                  };

                  return (
                    <Breakdown.Row
                      naked={naked}
                      color={session.color}
                      key={stats.tank_id}
                      minimized={!session.showCareer}
                      title={
                        tankDefinitions?.name ?? `Unknown tank ${stats.tank_id}`
                      }
                      type="tank"
                      tankType={tankDefinitions?.class}
                      treeType={tankDefinitions?.treeType}
                      stats={session.customColumns.map((customColumn) => {
                        const rowStat = rowStats[customColumn.display];

                        if (!rowStat) return undefined;

                        return {
                          ...rowStat,
                          delta:
                            customColumn.showDelta &&
                            rowStat.percentile === undefined
                              ? rowStat.delta
                              : undefined,
                        };
                      })}
                    />
                  );
                },
              )}
          </Breakdown.Root>
        </div>
      </ContextMenu.Trigger>

      <Menu reset={resetSession} Builder={ContextMenu} />
    </ContextMenu.Root>
  );
}
