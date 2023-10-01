'use client';

import { useEffect, useState } from 'react';
import * as Breakdown from '../../../components/Breakdown';
import { TreeTypeEnum } from '../../../components/Tanks';
import { WARGAMING_APPLICATION_ID } from '../../../constants/wargamingApplicationID';
import calculateWN8 from '../../../core/blitz/calculateWN8';
import { diffNormalizedTankStats } from '../../../core/blitz/diffNormalizedTankStats';
import getWN8Percentile from '../../../core/blitz/getWN8Percentile';
import getWargamingResponse from '../../../core/blitz/getWargamingResponse';
import { TankopediaEntry, tankopedia } from '../../../core/blitz/tankopedia';
import { tankAverages } from '../../../core/blitzstars/tankAverages';
import { useSession } from '../../../stores/session';
import { IndividualTankStats, TanksStats } from '../../../types/tanksStats';

const REFRESH_RATE = 1 / 5;

export default function SessionPage() {
  const session = useSession();
  const since = session.isTracking ? new Date(session.time) : undefined;
  const [diff, setDiff] = useState<
    | {
        careerWN8: number;

        list: {
          stats: IndividualTankStats;
          tankopedia?: TankopediaEntry;
          career: IndividualTankStats;
          currentWN8?: number;
          careerWN8?: number;
        }[];
      }
    | undefined
  >(undefined);
  const battles = diff?.list.reduce(
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
      ) / battles!
    : 0;
  const careerWinrate =
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.wins,
      0,
    ) /
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.battles,
      0,
    );
  const currentDamage = diff
    ? diff.list.reduce(
        (accumulator, { stats }) => accumulator + stats.all.damage_dealt,
        0,
      ) / battles!
    : 0;
  const careerDamage =
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.damage_dealt,
      0,
    ) /
    tankStatsArray.reduce(
      (accumulator, stats) => accumulator + stats.all.battles,
      0,
    );

  useEffect(() => {
    async function recalculateDiff() {
      if (session.isTracking) {
        const { id, region } = session;
        const careerRaw = await getWargamingResponse<TanksStats>(
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
        const awaitedTankopedia = await tankopedia;
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
              diffNormalizedTankStats(session.tankStats, career),
            ) as IndividualTankStats[]
          ).map((stats) => {
            return {
              stats,
              tankopedia: awaitedTankopedia[stats.tank_id],
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

  return (
    <Breakdown.Root>
      {session.isTracking && since !== undefined && diff !== undefined && (
        <Breakdown.Row
          title={`Since ${since.toLocaleString(undefined, {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            year: 'numeric',
            day: 'numeric',
          })}`}
          stats={[
            {
              title: 'Battles',
              current: battles!.toLocaleString(),
              career: tankStatsArray
                .reduce(
                  (accumulator, stats) => accumulator + stats.all.battles,
                  0,
                )
                .toLocaleString(),
            },
            {
              title: 'Winrate',
              current: battles ? `${(100 * sessionWinrate).toFixed(2)}%` : '--',
              career: `${(100 * careerWinrate).toFixed(2)}%`,
              delta: sessionWinrate - careerWinrate,
            },
            (() => {
              const battlesWithWN8 = diff.list.reduce(
                (accumulator, { currentWN8, stats }) =>
                  (currentWN8 === undefined ? 0 : stats.all.battles) +
                  accumulator,
                0,
              );
              const currentWN8 =
                diff.list.reduce(
                  (accumulator, { currentWN8, stats }) =>
                    stats.all.battles * (currentWN8 ?? 0) + accumulator,
                  0,
                ) / battlesWithWN8;

              return {
                title: 'WN8',
                current: battlesWithWN8
                  ? Math.round(currentWN8).toLocaleString()
                  : '--',
                percentile: battlesWithWN8
                  ? getWN8Percentile(currentWN8)
                  : undefined,
                career: Math.round(diff.careerWN8).toLocaleString(),
              };
            })(),
            {
              title: 'Damage',
              delta: currentDamage - careerDamage,
              current: battles
                ? Math.round(currentDamage).toLocaleString()
                : '--',
              career: Math.round(careerDamage).toLocaleString(),
            },
          ]}
        />
      )}

      {diff?.list
        .sort((a, b) => b.stats.last_battle_time - a.stats.last_battle_time)
        .map(({ stats, tankopedia, career, careerWN8, currentWN8 }) => (
          <Breakdown.Row
            key={stats.tank_id}
            title={tankopedia?.name ?? `Unknown tank ${stats.tank_id}`}
            type="tank"
            tankType={tankopedia?.type}
            treeType={(() => {
              if (tankopedia?.is_collectible) return TreeTypeEnum.Collector;
              if (tankopedia?.is_premium) return TreeTypeEnum.Premium;
            })()}
            stats={[
              {
                title: 'Battles',
                current: stats.all.battles.toLocaleString(),
                career: career.all.battles.toLocaleString(),
              },
              {
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
              {
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
              {
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
            ]}
          />
        ))}
    </Breakdown.Root>
  );
}
