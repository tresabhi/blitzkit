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
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getTankStats from '../core/blitz/getTankStats.js';
import getWN8 from '../core/blitz/getWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodicStart from '../core/blitzstars/getPeriodStart.js';
import getTankStatsOverTime, {
  emptyAllStats,
} from '../core/blitzstars/getTankStatsOverTime.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import cmdName from '../core/interaction/cmdName.js';
import fullBlitzStarsStats from '../core/interaction/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import addStatPeriodChoices, {
  StatPeriod,
  statPeriodNames,
} from '../core/options/addStatPeriodChoices.js';
import addTankChoices from '../core/options/addTankChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('tankstats'))
    .setDescription('Stats for a tank over a period')
    .addStringOption(addTankChoices)
    .addStringOption(addStatPeriodChoices)
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const tank = await resolveTankId(
      interaction,
      interaction.options.getString('tank')!,
    );
    const period = interaction.options.getString('period') as StatPeriod;
    const blitzAccount = await getBlitzAccount(interaction);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const tankStats = await getTankStats(interaction, server, id);
    let stats: AllStats;
    const tankId = Number(tank);

    if (period === 'career') {
      stats =
        tankStats.find((stats) => stats.tank_id === tankId)?.all ??
        emptyAllStats;
    } else {
      const tankStatsOverTime = await getTankStatsOverTime(
        interaction,
        server,
        id,
        getPeriodicStart(period),
        getPeriodNow(),
      );

      stats = tankStatsOverTime[tankId] ?? emptyAllStats;
    }

    const image = await render(
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={`(${resolveTankName(tankId)})`}
          image={tankopedia[tankId].images.normal}
          description={`${
            statPeriodNames[period]
          } • ${new Date().toDateString()} • ${BLITZ_SERVERS[server]}`}
        />

        {stats.battles === 0 && <NoBattlesInPeriod />}
        {stats.battles > 0 && (
          <GenericAllStats
            stats={stats}
            supplementaryStats={{
              tier: tankopedia[tankId].tier,
              WN8: getWN8(tankAverages[tankId].all, stats),
            }}
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

  autocomplete: (interaction) => {
    tanksAutocomplete(interaction);
    usernameAutocomplete(interaction);
  },
} satisfies CommandRegistry;
