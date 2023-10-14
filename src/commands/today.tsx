import { SlashCommandBuilder } from 'discord.js';
import * as Breakdown from '../components/Breakdown';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { AllStats, getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getTankStats from '../core/blitz/getTankStats';
import getTreeType from '../core/blitz/getTreeType';
import resolveTankName from '../core/blitz/resolveTankName';
import getPeriodNow from '../core/blitzkrieg/getPeriodNow';
import getTimeDaysAgo from '../core/blitzkrieg/getTimeDaysAgo';
import getStatsInPeriod from '../core/blitzstars/getStatsInPeriod';
import { tankAverages } from '../core/blitzstars/tankAverages';
import { tankopedia } from '../core/blitzstars/tankopedia';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import buttonLink from '../core/discord/buttonLink';
import buttonPrimary from '../core/discord/buttonPrimary';
import commandToURL from '../core/discord/commandToURL';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand, {
  ResolvedPlayer,
} from '../core/discord/resolvePlayerFromCommand';
import calculateWN8 from '../core/statistics/calculateWN8';
import getWN8Percentile from '../core/statistics/getWN8Percentile';
import sumStats from '../core/statistics/sumStats';
import { CommandRegistry } from '../events/interactionCreate';
import { PossiblyPromise } from '../types/possiblyPromise';

async function render(
  { region: server, id }: ResolvedPlayer,
  cutoff = Infinity,
  maximized = 4,
  showTotal = true,
  naked?: boolean,
) {
  const { diff: diffed, order } = await getStatsInPeriod(
    server,
    id,
    getTimeDaysAgo(server, 1),
    getPeriodNow(),
  );
  const accountInfo = await getAccountInfo(server, id);
  const clanData = await getClanAccountInfo(server, id);
  const careerTankStatsRaw = await getTankStats(server, id);
  const careerStats: Record<number, AllStats> = showTotal
    ? {
        0: accountInfo.statistics.all,
      }
    : {};
  const allStatsToAccumulate: AllStats[] = [];

  Object.entries(diffed).forEach(([, tankStats]) => {
    allStatsToAccumulate.push(tankStats);
  });
  Object.entries(careerTankStatsRaw).forEach(([, tankStats]) => {
    careerStats[tankStats.tank_id] = tankStats.all;
  });

  const accumulatedStats = sumStats(allStatsToAccumulate);

  if (showTotal && Object.keys(diffed).length > 0) {
    diffed[0] = accumulatedStats;
  }

  const tankStatsOverTimeEntries = Object.entries(diffed);
  const todayWN8s = await tankStatsOverTimeEntries.reduce<
    PossiblyPromise<Record<number, number>>
  >(async (accumulator, [tankIdString, tankStats]) => {
    const tankId = parseInt(tankIdString);

    return (showTotal && tankId === 0) || !(await tankAverages)[tankId]
      ? accumulator
      : {
          ...(await accumulator),
          [tankId]: calculateWN8((await tankAverages)[tankId].all, tankStats),
        };
  }, {});

  const careerWN8s = await careerTankStatsRaw.reduce<
    PossiblyPromise<Record<number, number>>
  >(async (accumulator, { tank_id }) => {
    return (showTotal && tank_id === 0) ||
      (await tankAverages)[tank_id] === undefined
      ? accumulator
      : {
          ...(await accumulator),
          [tank_id]: calculateWN8(
            (await tankAverages)[tank_id].all,
            careerStats[tank_id],
          ),
        };
  }, {});
  const todayWN8sEntries = Object.entries(todayWN8s);
  const careerWN8sEntries = Object.entries(careerWN8s);

  if (showTotal) {
    todayWN8s[0] =
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString, wn8]) =>
          accumulator + wn8 * diffed[Number(tankIdString)].battles,
        0,
      ) /
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString]) =>
          accumulator + diffed[Number(tankIdString)].battles,
        0,
      );
    careerWN8s[0] =
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + WN8 * careerStats[Number(tankIdString)].battles,
        0,
      ) /
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + careerStats[Number(tankIdString)].battles,
        0,
      );
  }

  const rows = await Promise.all(
    [
      // this code unreadable on god will forget tomorrow no cap
      ...(order.length === 0 || !showTotal ? [] : [0]),
      ...(isFinite(cutoff) ? order.slice(0, cutoff) : order),
    ].map(async (id, index) => {
      const tankStats = diffed[id];
      const career = careerStats[id];
      const tankopediaEntry = (await tankopedia)[id];

      return (
        <Breakdown.Row
          key={id}
          type={!showTotal || id !== 0 ? 'tank' : 'summary'}
          tankType={tankopediaEntry?.type}
          treeType={tankopediaEntry ? await getTreeType(id) : undefined}
          title={showTotal && id === 0 ? 'Total' : await resolveTankName(id)}
          minimized={showTotal ? index > maximized : index + 1 > maximized}
          stats={[
            {
              title: 'Battles',
              current: tankStats.battles.toLocaleString(),
              career: career.battles.toLocaleString(),
            },
            {
              title: 'Winrate',
              current: `${(100 * (tankStats.wins / tankStats.battles)).toFixed(
                2,
              )}%`,
              career: `${(100 * (career.wins / career.battles)).toFixed(2)}%`,
              delta:
                tankStats.wins / tankStats.battles -
                career.wins / career.battles,
            },
            {
              title: 'WN8',
              current: isNaN(todayWN8s[id])
                ? undefined
                : Math.round(todayWN8s[id]).toLocaleString(),
              career: isNaN(careerWN8s[id])
                ? undefined
                : Math.round(careerWN8s[id]).toLocaleString(),
              percentile: isNaN(todayWN8s[id])
                ? undefined
                : getWN8Percentile(todayWN8s[id]),
            },
            {
              title: 'Damage',
              current: Math.round(
                tankStats.damage_dealt / tankStats.battles,
              ).toLocaleString(),
              career: Math.round(
                career.damage_dealt / career.battles,
              ).toLocaleString(),
              delta:
                tankStats.damage_dealt / tankStats.battles -
                career.damage_dealt / career.battles,
            },
          ]}
        />
      );
    }),
  );

  return naked ? (
    <Wrapper naked>
      <Breakdown.Root>{rows}</Breakdown.Root>
    </Wrapper>
  ) : (
    <Wrapper>
      <TitleBar
        name={accountInfo.nickname}
        image={
          clanData?.clan
            ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData?.clan?.emblem_set_id}.png`
            : undefined
        }
        description="Today's breakdown"
      />

      {rows.length === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
      {rows.length > 0 && <Breakdown.Root>{rows}</Breakdown.Root>}
    </Wrapper>
  );
}

export const todayCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('today')
    .setDescription('A general daily breakdown of your performance')
    .addStringOption(addUsernameChoices)
    .addIntegerOption((option) =>
      option
        .setName('cutoff')
        .setDescription(
          'The maximum number of tanks to display (default: Infinity)',
        )
        .setRequired(false)
        .setMinValue(1),
    )
    .addIntegerOption((option) =>
      option
        .setName('maximized')
        .setDescription(
          'The number of rows with full stats after which all are collapsed (default: 4)',
        )
        .setMinValue(0)
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('show-total')
        .setDescription('Show the total stats at the top (default: true)')
        .setRequired(false),
    ),

  async handler(interaction) {
    const player = await resolvePlayerFromCommand(interaction);
    const cutoff = interaction.options.getInteger('cutoff') ?? undefined;
    const maximized = interaction.options.getInteger('maximized') ?? undefined;
    const showTotal = interaction.options.getBoolean('show-total') ?? undefined;
    const { nickname } = await getAccountInfo(player.region, player.id);
    const path = commandToURL(interaction, {
      ...player,
      cutoff,
      maximized,
      'show-total': showTotal,
    });

    return [
      await render(player, cutoff, maximized, showTotal, false),
      buttonPrimary(path, 'Refresh'),
      // linkButton(`https://example.com/${path}`, 'Embed'),
      buttonLink(
        `https://www.blitzstars.com/player/${player.region}/${nickname}`,
        'BlitzStars',
      ),
    ];
  },

  autocomplete: autocompleteUsername,

  async button(interaction) {
    const player = await resolvePlayerFromButton(interaction);

    return await render(player);
  },
};
