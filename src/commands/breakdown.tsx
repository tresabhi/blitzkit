import { SlashCommandBuilder } from 'discord.js';
import { chunk } from 'lodash';
import * as Breakdown from '../components/Breakdown';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { AllStats, getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import getTreeType from '../core/blitz/getTreeType';
import resolveTankName from '../core/blitz/resolveTankName';
import { filtersToDescription } from '../core/blitzkrieg/filtersToDescription';
import { getBlitzStarsLinkButton } from '../core/blitzstars/getBlitzStarsLinkButton';
import getStatsInPeriod from '../core/blitzstars/getStatsInPeriod';
import { tankAverages } from '../core/blitzstars/tankAverages';
import { tankopedia } from '../core/blitzstars/tankopedia';
import addFilterOptions from '../core/discord/addFilterOptions';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import buttonPrimary from '../core/discord/buttonPrimary';
import commandToURL from '../core/discord/commandToURL';
import { getCustomPeriodParams } from '../core/discord/getCustomPeriodParams';
import { getFiltersFromButton } from '../core/discord/getFiltersFromButton';
import { getFiltersFromCommand } from '../core/discord/getFiltersFromCommand';
import resolvePeriodFromButton from '../core/discord/resolvePeriodFromButton';
import resolvePeriodFromCommand, {
  ResolvedPeriod,
} from '../core/discord/resolvePeriodFromCommand';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand, {
  ResolvedPlayer,
} from '../core/discord/resolvePlayerFromCommand';
import calculateWN8 from '../core/statistics/calculateWN8';
import { StatFilters, filterStats } from '../core/statistics/filterStats';
import getWN8Percentile from '../core/statistics/getWN8Percentile';
import { CommandRegistryRaw } from '../events/interactionCreate';

const ROWS_PER_PAGE = 8;
const MAX_PAGES = 10;

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  filters: StatFilters,
) {
  const awaitedTankopedia = await tankopedia;
  const awaitedTankAverages = await tankAverages;
  const statsInPeriod = await getStatsInPeriod(region, id, start, end);
  const { filteredOrder } = await filterStats(statsInPeriod, filters);
  const accountInfo = await getAccountInfo(region, id);
  const clanData = await getClanAccountInfo(region, id, ['clan']);
  const tankStats = await getTankStats(region, id);
  const filterDescriptions = await filtersToDescription(filters);
  const orderedCurrentStats: AllStats[] = [];
  const orderedCareerStats: AllStats[] = [];
  const orderedCurrentWN8: (number | undefined)[] = [];
  const orderedCareerWN8: (number | undefined)[] = [];
  const orderedCareerWN8Full: (number | undefined)[] = [];

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
        title="Total"
        stats={[
          {
            title: 'Battles',
            current: currentBattles,
            career: careerBattles,
          },
          {
            title: 'Winrate',
            current: `${(100 * currentWinrate).toFixed(2)}%`,
            career: `${(100 * careerWinrate).toFixed(2)}%`,
            delta: currentWinrate - careerWinrate,
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
            current: Math.round(currentDamage).toLocaleString(),
            career: Math.round(careerDamage).toLocaleString(),
            delta: currentDamage - careerDamage,
          },
        ]}
      />,
    );

    await Promise.all(
      filteredOrder.map(async (id, index) => {
        const tankopediaEntry = awaitedTankopedia[id];
        const current = orderedCurrentStats[index];
        const career = orderedCareerStats[index];
        const currentWN8 = orderedCurrentWN8[index];
        const careerWN8 = orderedCareerWN8[index];

        children.push(
          <Breakdown.Row
            key={id}
            type="tank"
            tankType={tankopediaEntry?.type}
            treeType={tankopediaEntry ? await getTreeType(id) : undefined}
            title={await resolveTankName(id)}
            stats={[
              {
                title: 'Battles',
                current: current.battles.toLocaleString(),
                career: career.battles.toLocaleString(),
              },
              {
                title: 'Winrate',
                current: `${(100 * (current.wins / current.battles)).toFixed(
                  2,
                )}%`,
                career: `${(100 * (career.wins / career.battles)).toFixed(2)}%`,
                delta:
                  current.wins / current.battles - career.wins / career.battles,
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
      }),
    );
  }

  const pages = chunk(
    children,
    Math.max(Math.ceil(children.length / MAX_PAGES), ROWS_PER_PAGE),
  );

  if (filteredOrder.length > 0) {
    return pages
      .map((page, index) => (
        <Wrapper>
          {index === 0 && (
            <TitleBar
              name={accountInfo.nickname}
              image={
                clanData?.clan
                  ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData?.clan?.emblem_set_id}.png`
                  : undefined
              }
              description={`${name} • ${filterDescriptions}`}
            />
          )}

          <Breakdown.Root>{page}</Breakdown.Root>
        </Wrapper>
      ))
      .reverse();
  } else {
    return [
      <Wrapper>
        <TitleBar
          name={accountInfo.nickname}
          image={
            clanData?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`${name} • ${filterDescriptions}`}
        />

        {filteredOrder.length === 0 && (
          <NoData type={NoDataType.BattlesInPeriod} />
        )}
      </Wrapper>,
    ];
  }
}

export const breakdownCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const command = await addFilterOptions(
      new SlashCommandBuilder()
        .setName('breakdown')
        .setDescription("A period's breakdown by tanks played"),
      (option) => option.addStringOption(addUsernameChoices),
    );

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const filters = await getFiltersFromCommand(interaction);
        const path = commandToURL(interaction, {
          ...player,
          ...getCustomPeriodParams(interaction),
          ...filters,
        });

        return [
          ...(await render(player, period, filters)),
          buttonPrimary(path, 'Refresh'),
          await getBlitzStarsLinkButton(player.region, player.id),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);
        const filters = getFiltersFromButton(interaction);

        return await render(player, period, filters);
      },
    });
  },
);
