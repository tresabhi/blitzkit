import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import GenericAllStats from '../components/GenericAllStats.js';
import NoBattlesInPeriod from '../components/NoBattlesInPeriod.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import sumStats from '../core/blitz/sumStats.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodicStart from '../core/blitzstars/getPeriodStart.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import fullBlitzStarsStats from '../core/interaction/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addStatPeriodChoices, {
  StatPeriod,
  statPeriodNames,
} from '../core/options/addStatPeriodChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
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
    .addStringOption(addStatPeriodChoices)
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const period = interaction.options.getString('period') as StatPeriod;
    const username = interaction.options.getString('username')!;
    const blitzAccount = await getBlitzAccount(interaction, username);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${id}&extra=clan`,
    );
    let stats: AllStats;
    let supplementaryStats: SupplementaryStats | undefined;

    if (period === 'career') {
      stats = accountInfo[id].statistics.all;
    } else {
      const tankStatsOverTime = await getTankStatsOverTime(
        interaction,
        server,
        id,
        getPeriodicStart(period),
        getPeriodNow(),
      );
      const entries = Object.entries(tankStatsOverTime);
      const totalBattles = entries.reduce(
        (accumulator, [, stats]) => accumulator + stats.battles,
        0,
      );

      supplementaryStats = {
        tier:
          entries.reduce((accumulator, [tankIdString, stats]) => {
            const tankId = Number(tankIdString);
            const tankTier = tankopedia[tankId].tier;

            return accumulator + tankTier * stats.battles;
          }, 0) / totalBattles,
        WN8:
          entries.reduce((accumulator, [tankIdString, stats]) => {
            const tankId = Number(tankIdString);

            // edge case where new tanks don't have averages
            if (tankAverages[tankId]) {
              const tankWN8 = getWN8(tankAverages[tankId].all, stats);
              return accumulator + tankWN8 * stats.battles;
            } else return accumulator;
          }, 0) / totalBattles,
      };

      stats = sumStats(entries.map(([, stats]) => stats));
    }

    const image = await render(
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
          description={`${
            statPeriodNames[period]
          } • ${new Date().toDateString()} • ${BLITZ_SERVERS[server]}`}
        />

        {stats.battles === 0 && <NoBattlesInPeriod />}
        {stats.battles > 0 && (
          <GenericAllStats
            stats={stats}
            supplementaryStats={supplementaryStats}
          />
        )}

        <PoweredByBlitzStars />
      </Wrapper>,
    );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      fullBlitzStarsStats(server, accountInfo[id].nickname),
      supportBlitzStars,
    );

    await interaction.editReply({
      files: [image],
      components: [actionRow],
    });

    console.log(`Showing stats for ${accountInfo[id].nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
