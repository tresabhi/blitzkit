import {
  blitzStarsTankAverages,
  BlitzStats,
  calculateWN8,
  filterStats,
  getAccountInfo,
  getClanAccountInfo,
  getTankStats,
  getWN8Percentile,
  StatFilters,
  TankDefinition,
  tankDefinitions,
} from '@blitzkit/core';
import { Locale } from 'discord.js';
import { chunk } from 'lodash';
import * as Breakdown from '../../components/Breakdown';
import { CommandWrapper } from '../../components/CommandWrapper';
import { NoData } from '../../components/NoData';
import { TitleBar } from '../../components/TitleBar';
import { filtersToDescription } from '../../core/blitzkit/filtersToDescription';
import { UserError } from '../../core/blitzkit/userError';
import { getStatsInPeriod } from '../../core/blitzstars/getStatsInPeriod';
import { ResolvedPeriod } from '../../core/discord/resolvePeriodFromCommand';
import { ResolvedPlayer } from '../../core/discord/resolvePlayerFromCommand';
import { translator } from '../../core/localization/translator';

const ROWS_PER_PAGE = 8;
const MAX_PAGES = 9;

export async function renderBreakdown(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  filters: StatFilters,
  locale: Locale,
) {
  const { t, translate } = translator(locale);
  const awaitedTankDefinitions = await tankDefinitions;
  const awaitedTankAverages = await blitzStarsTankAverages;
  const statsInPeriod = await getStatsInPeriod(region, id, start, end, locale);
  const { filteredOrder } = await filterStats(statsInPeriod, filters);
  const accountInfo = await getAccountInfo(region, id);
  const clanData = await getClanAccountInfo(region, id, ['clan']);
  const tankStats = await getTankStats(region, id);
  const filterDescriptions = await filtersToDescription(filters, locale);
  const orderedCurrentStats: BlitzStats[] = [];
  const orderedCareerStats: BlitzStats[] = [];
  const orderedCurrentWN8: (number | undefined)[] = [];
  const orderedCareerWN8: (number | undefined)[] = [];
  const orderedCareerWN8Full: (number | undefined)[] = [];

  if (tankStats === null) {
    throw new UserError(t`bot.common.errors.no_tank_stats`);
  }

  filteredOrder.forEach((id) => {
    const tankAveragesEntry = awaitedTankAverages[id];
    const current = statsInPeriod.diff[id];
    const career = tankStats.find((tank) => tank.tank_id === id)!.all;
    const currentWN8 = tankAveragesEntry
      ? calculateWN8(tankAveragesEntry.all, current)
      : undefined;
    const careerWN8 = tankAveragesEntry
      ? calculateWN8(tankAveragesEntry.all, career)
      : undefined;

    orderedCurrentStats.push(current);
    orderedCareerStats.push(career);
    orderedCurrentWN8.push(currentWN8);
    orderedCareerWN8.push(careerWN8);
  });
  tankStats.forEach((tank) => {
    const tankAveragesEntry = awaitedTankAverages[tank.tank_id];

    orderedCareerWN8Full.push(
      tankAveragesEntry
        ? calculateWN8(tankAveragesEntry.all, tank.all)
        : undefined,
    );
  });

  const currentBattles = orderedCurrentStats.reduce(
    (accumulator, current) => accumulator + current.battles,
    0,
  );
  const careerBattles = tankStats.reduce(
    (accumulator, current) => accumulator + current.all.battles,
    0,
  );
  const currentWinrate =
    orderedCurrentStats.reduce(
      (accumulator, current) => accumulator + current.wins,
      0,
    ) / currentBattles;
  const careerWinrate =
    tankStats.reduce(
      (accumulator, current) => accumulator + current.all.wins,
      0,
    ) / careerBattles;
  const currentWN8 =
    orderedCurrentWN8.reduce<number>(
      (accumulator, current, index) =>
        accumulator + (current ?? 0) * orderedCurrentStats[index].battles,
      0,
    ) /
    orderedCurrentStats.reduce(
      (accumulator, current, index) =>
        accumulator +
        (orderedCurrentWN8[index] === undefined ? 0 : current.battles),
      0,
    );
  const careerWN8 =
    orderedCareerWN8Full.reduce<number>(
      (accumulator, current) => accumulator + (current ?? 0),
      0,
    ) /
    tankStats.reduce(
      (accumulator, current, index) =>
        accumulator +
        (orderedCareerWN8Full[index] === undefined ? 0 : current.all.battles),
      0,
    );
  const currentDamage =
    orderedCurrentStats.reduce(
      (accumulator, current) => accumulator + current.damage_dealt,
      0,
    ) / currentBattles;
  const careerDamage =
    tankStats.reduce(
      (accumulator, current) => accumulator + current.all.damage_dealt,
      0,
    ) / careerBattles;

  const children: JSX.Element[] = [];

  if (filteredOrder.length > 0) {
    children.push(
      <Breakdown.Row
        key={id}
        type="summary"
        title={t`bot.commands.breakdown.body.total`}
        stats={[
          {
            title: t`bot.commands.breakdown.body.battles`,
            current: currentBattles,
            career: careerBattles,
          },
          {
            title: t`bot.commands.breakdown.body.winrate`,
            current: `${(100 * currentWinrate).toFixed(2)}%`,
            career: `${(100 * careerWinrate).toFixed(2)}%`,
            delta: currentWinrate - careerWinrate,
          },
          {
            title: t`bot.commands.breakdown.body.wn8`,
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
            title: t`bot.commands.breakdown.body.damage`,
            current: Math.round(currentDamage).toLocaleString(),
            career: Math.round(careerDamage).toLocaleString(),
            delta: currentDamage - careerDamage,
          },
        ]}
      />,
    );

    filteredOrder.forEach((id, index) => {
      const tankDefinition = awaitedTankDefinitions[id] as
        | TankDefinition
        | undefined;
      const current = orderedCurrentStats[index];
      const career = orderedCareerStats[index];
      const currentWN8 = orderedCurrentWN8[index];
      const careerWN8 = orderedCareerWN8[index];

      children.push(
        <Breakdown.Row
          key={id}
          type="tank"
          tankType={tankDefinition?.class}
          treeType={tankDefinition?.treeType}
          title={
            tankDefinition?.name ??
            translate('bot.commands.breakdown.body.unknown_tank', [`${id}`])
          }
          stats={[
            {
              title: t`bot.commands.breakdown.body.battles`,
              current: current.battles.toLocaleString(),
              career: career.battles.toLocaleString(),
            },
            {
              title: t`bot.commands.breakdown.body.winrate`,
              current: `${(100 * (current.wins / current.battles)).toFixed(
                2,
              )}%`,
              career: `${(100 * (career.wins / career.battles)).toFixed(2)}%`,
              delta:
                current.wins / current.battles - career.wins / career.battles,
            },
            {
              title: t`bot.commands.breakdown.body.wn8`,
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
              title: t`bot.commands.breakdown.body.damage`,
              current: Math.round(
                current.damage_dealt / current.battles,
              ).toLocaleString(),
              career: Math.round(
                career.damage_dealt / career.battles,
              ).toLocaleString(),
              delta:
                current.damage_dealt / current.battles -
                career.damage_dealt / career.battles,
            },
          ]}
        />,
      );
    });
  }

  const pages = chunk(
    children,
    Math.max(Math.ceil(children.length / MAX_PAGES), ROWS_PER_PAGE),
  );

  if (filteredOrder.length > 0) {
    return pages
      .map((page, index) => (
        <CommandWrapper>
          {index === 0 && (
            <TitleBar
              title={accountInfo.nickname}
              image={
                clanData?.clan
                  ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData?.clan?.emblem_set_id}.png`
                  : undefined
              }
              description={`${name} • ${filterDescriptions}`}
            />
          )}

          <Breakdown.Root>{page}</Breakdown.Root>
        </CommandWrapper>
      ))
      .reverse();
  } else {
    return [
      <CommandWrapper>
        <TitleBar
          title={accountInfo.nickname}
          image={
            clanData?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`${name} • ${filterDescriptions}`}
        />

        <NoData type="battles_in_period" locale={locale} />
      </CommandWrapper>,
    ];
  }
}
