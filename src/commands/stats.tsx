import { SlashCommandBuilder } from 'discord.js';
import GenericAllStats from '../components/GenericAllStats.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import sumStats from '../core/blitz/sumStats.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodicStart from '../core/blitzstars/getPeriodStart.js';
import getPeriodStartFromDaysAgo from '../core/blitzstars/getPeriodStartFromDaysAgo.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import fullBlitzStarsStats from '../core/interaction/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addCustomPeriodOption from '../core/options/addCustomPeriodOption.js';
import addPeriodChoices, {
  StatPeriod,
  statPeriodNames,
} from '../core/options/addPeriodChoices.js';
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
    .setName(cmdName('stats'))
    .setDescription("Gets the user's in-game statistics")
    .addSubcommand((option) =>
      option
        .setName('period')
        .setDescription('Pick from a predetermined periods')
        .addStringOption(addPeriodChoices)
        .addStringOption(addUsernameOption),
    )
    .addSubcommand((option) =>
      addCustomPeriodOption(option)
        .setName('customperiod')
        .setDescription('Custom periods')
        .addStringOption(addUsernameOption),
    ),

  async execute(interaction) {
    const period = interaction.options.getString('period') as StatPeriod;
    const { id, server } = await getBlitzAccount(interaction);
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    );
    let stats: AllStats;
    let supplementaryStats: SupplementaryStats | undefined;
    let hasWN8AccumulatedAtAll = false;
    const isCustomPeriod =
      interaction.options.getSubcommand() === 'customperiod';
    let periodName: string;
    const startRaw = interaction.options.getInteger('start')!;
    const endRaw = interaction.options.getInteger('end')!;
    const start = Math.max(startRaw, endRaw);
    const end = Math.min(startRaw, endRaw);

    if (isCustomPeriod) {
      periodName = `${start} to ${end} days ago`;
    } else {
      periodName = statPeriodNames[period];
    }

    if (period === 'career') {
      const tankStats = await getTankStats(server, id);
      stats = accountInfo[id].statistics.all;
      const totalBattles = tankStats.reduce(
        (accumulator, { all }) => accumulator + all.battles,
        0,
      );

      supplementaryStats = {
        tier:
          tankStats.reduce(
            (accumulator, { tank_id, all }) =>
              accumulator + tankopedia[tank_id].tier * all.battles,
            0,
          ) / totalBattles,
        WN8:
          tankStats.reduce((accumulator, { tank_id, all }) => {
            if (tankAverages[tank_id]) {
              const tankWN8 = getWN8(tankAverages[tank_id].all, all);

              if (isNaN(tankWN8)) return accumulator;

              hasWN8AccumulatedAtAll = true;

              return accumulator + tankWN8 * all.battles;
            } else return accumulator;
          }, 0) / totalBattles,
      };
    } else {
      const tankStatsOverTime = await getTankStatsOverTime(
        server,
        id,
        isCustomPeriod
          ? getPeriodStartFromDaysAgo(start)
          : getPeriodicStart(period),
        isCustomPeriod ? getPeriodStartFromDaysAgo(end) : getPeriodNow(),
      );
      const entries = Object.entries(tankStatsOverTime);
      const totalBattles = entries.reduce(
        (accumulator, [, stats]) => accumulator + stats.battles,
        0,
      );

      supplementaryStats = {
        tier:
          entries.reduce((accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);
            const tankTier = tankopedia[tankId].tier;

            return accumulator + tankTier * stats.battles;
          }, 0) / totalBattles,
        WN8:
          entries.reduce((accumulator, [tankIdString, stats]) => {
            const tankId = parseInt(tankIdString);

            // edge case where new tanks don't have averages
            if (tankAverages[tankId]) {
              const tankWN8 = getWN8(tankAverages[tankId].all, stats);

              if (isNaN(tankWN8)) return accumulator;

              hasWN8AccumulatedAtAll = true;

              return accumulator + tankWN8 * stats.battles;
            } else return accumulator;
          }, 0) / totalBattles,
      };

      stats = sumStats(entries.map(([, stats]) => stats));
    }

    if (!hasWN8AccumulatedAtAll) supplementaryStats.WN8 = undefined;

    return [
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={
            clanData[id]?.clan ? `[${clanData[id]?.clan?.tag}]` : undefined
          }
          image={
            clanData[id]?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`${periodName} • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {stats.battles === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
        {stats.battles > 0 && (
          <GenericAllStats
            stats={stats}
            supplementaryStats={supplementaryStats}
          />
        )}

        <PoweredByBlitzStars />
      </Wrapper>,
      fullBlitzStarsStats(server, accountInfo[id].nickname),
      supportBlitzStars,
    ];
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
