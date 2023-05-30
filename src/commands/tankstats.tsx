import {
  ActionRowBuilder,
  ButtonBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import GenericStats from '../components/GenericStats/index.js';
import NoBattlesInPeriod from '../components/NoBattlesInPeriod.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import fullBlitzStarsStats from '../core/actions/fullBlitzStarsStats.js';
import { supportBlitzStars } from '../core/actions/supportBlitzStars.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import getPeriodNow from '../core/blitzstars/getPeriodNow.js';
import getPeriodicStart from '../core/blitzstars/getPeriodStart.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import { tankopedia } from '../core/blitzstars/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
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
import { TanksStats } from '../types/tanksStats.js';
import resolveTankName from '../utilities/resolveTankName.js';

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
    const username = interaction.options.getString('username')!;
    const blitzAccount = await getBlitzAccount(interaction, username);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const tankStats = await getWargamingResponse<TanksStats>(
      `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    let stats: AllStats;

    if (period === 'career') {
      stats = tankStats[id].find(
        (stats) => stats.tank_id === Number(tank),
      )!.all;
    } else {
      stats = (
        await getTankStatsOverTime(
          server,
          id,
          getPeriodicStart(period),
          getPeriodNow(),
        )
      )[Number(tank)];
    }

    const image = await render(
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={`(${resolveTankName(Number(tank))})`}
          image={tankopedia[Number(tank)].images.normal}
          description={`${
            statPeriodNames[period]
          } • ${new Date().toDateString()} • ${BLITZ_SERVERS[server]}`}
        />

        {stats.battles === 0 && <NoBattlesInPeriod />}
        {stats.battles > 0 && (
          // TODO: GenericStats generator for AllStats
          <GenericStats
            stats={[
              [
                'Winrate',
                `${(100 * (stats.wins / stats.battles)).toFixed(2)}%`,
              ],
              [
                'Survival',
                `${(100 * (stats.survived_battles / stats.battles)).toFixed(
                  2,
                )}%`,
              ],
              ['Accuracy', `${((stats.hits / stats.shots) * 100).toFixed(2)}%`],
              ['Battles', stats.battles],
              ['Wins', stats.wins],
              ['Losses', stats.losses],
              [
                'Average damage',
                (stats.damage_dealt / stats.battles).toFixed(0),
              ],
              ['Average XP', (stats.xp / stats.battles).toFixed(0)],
              ['Average shots', (stats.shots / stats.battles).toFixed(2)],
              ['Average hits', (stats.hits / stats.battles).toFixed(2)],
              ['Average kills', (stats.frags / stats.battles).toFixed(2)],
              ['Average spots', (stats.spotted / stats.battles).toFixed(2)],
              [
                'Damage ratio',
                (stats.damage_dealt / stats.damage_received).toFixed(2),
              ],
              [
                'Kills to death ratio',
                (
                  stats.frags /
                  (stats.battles - stats.survived_battles)
                ).toFixed(2),
              ],
            ]}
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
