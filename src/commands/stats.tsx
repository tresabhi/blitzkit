import { SlashCommandBuilder } from 'discord.js';
import GenericAllStats from '../components/GenericAllStats.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import sumStats from '../core/blitz/sumStats.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodStart from '../core/blitzstars/getPeriodStart.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import getTimeDaysAgo from '../core/blitzstars/getTimeDaysAgo.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import addPeriodSubCommands, {
  PERIOD_NAMES,
  Period,
} from '../core/options/addPeriodSubCommands.js';
import addTankChoices from '../core/options/addTankChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import {
  AccountInfo,
  AllStats,
  SupplementaryStats,
} from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    // TODO: embed cmdName into interaction create
    .setName(cmdName('stats'))
    .setDescription('In-game statistics')
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option.addStringOption(addUsernameOption),
      )
        .setName('player')
        .setDescription("Player's statistics"),
    )
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameOption),
      )
        .setName('tank')
        .setDescription("Tank's statistics"),
    ),

  async execute(interaction) {
    const commandGroup = interaction.options.getSubcommandGroup()!;
    const { id, server } = await getBlitzAccount(interaction);
    let nameDiscriminator: string | undefined;
    let image: string | undefined;
    const tankIdRaw = interaction.options.getString('tank')!;

    if (commandGroup === 'player') {
      const clan = (
        await getWargamingResponse<PlayerClanData>(
          `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
        )
      )[id]?.clan;

      if (clan) nameDiscriminator = `[${clan.tag}]`;
      image = clan
        ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
        : undefined;
    } else if (commandGroup === 'tank') {
      const tankId = await resolveTankId(tankIdRaw);
      nameDiscriminator = `(${resolveTankName(tankId)})`;
      image = tankopedia[tankId].images.normal;
    }

    const period = interaction.options.getSubcommand(true) as Period;
    let periodName: string;
    let periodStart: number;
    let periodEnd: number;

    if (period === 'custom') {
      const startRaw = interaction.options.getInteger('start')!;
      const endRaw = interaction.options.getInteger('end')!;
      const start = Math.max(startRaw, endRaw);
      const end = Math.min(startRaw, endRaw);

      periodName = `${start} to ${end} days ago`;
      periodStart = getTimeDaysAgo(start);
      periodEnd = getTimeDaysAgo(end);
    } else {
      periodName = PERIOD_NAMES[period];
      periodStart = getPeriodStart(period);
      periodEnd = getPeriodNow();
    }

    const tankStats = await getTankStatsOverTime(
      server,
      id,
      periodStart,
      periodEnd,
    );
    let stats: AllStats;
    let supplementaryStats: SupplementaryStats;

    if (commandGroup === 'player') {
      const entries = Object.entries(tankStats);
      stats = sumStats(entries.map(([, stats]) => stats));
      const battles = entries.reduce(
        (accumulator, [, stats]) => accumulator + stats.battles,
        0,
      );
      supplementaryStats = {
        WN8:
          entries.reduce(
            (accumulator, [tankIdString, stats]) =>
              accumulator +
              getWN8(tankAverages[parseInt(tankIdString)].all, stats) *
                stats.battles,
            0,
          ) / battles,
        tier:
          entries.reduce(
            (accumulator, [tankIdString, stats]) =>
              accumulator +
              tankopedia[parseInt(tankIdString)].tier * stats.battles,
            0,
          ) / battles,
      };
    } else if (commandGroup === 'tank') {
      const tankId = await resolveTankId(tankIdRaw);
      stats = tankStats[tankId];
      supplementaryStats = {
        WN8: getWN8(tankAverages[tankId].all, tankStats[tankId]),
        tier: tankopedia[tankId].tier,
      };
    }

    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );

    return (
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={nameDiscriminator}
          image={image}
          description={`${periodName} • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {stats!.battles === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
        {stats!.battles > 0 && (
          <GenericAllStats
            stats={stats!}
            supplementaryStats={supplementaryStats!}
          />
        )}

        <PoweredByBlitzStars />
      </Wrapper>
    );
  },

  autocomplete: (interaction) => {
    usernameAutocomplete(interaction);
    tanksAutocomplete(interaction);
  },
} satisfies CommandRegistry;
