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
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import sumStats from '../core/blitz/sumStats.js';
import getTankStatsOverTime from '../core/blitzstars/getTankStatsOverTime.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export type StatPeriod = 'today' | '30' | '60' | '90' | 'career';
export const statPeriodNames: Record<StatPeriod, string> = {
  today: "Today's statistics",
  30: '30-day statistics',
  60: '60-day statistics',
  90: '90-day statistics',
  career: 'Career statistics',
};

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('stats'))
    .setDescription("Gets the user's in-game statistics")
    .addStringOption((option) =>
      option
        .setName('period')
        .setDescription('The last number of days of stats')
        .setChoices(
          { name: 'Today', value: 'today' satisfies StatPeriod },
          { name: '30 Days', value: '30' satisfies StatPeriod },
          { name: '60 Days', value: '60' satisfies StatPeriod },
          { name: '90 Days', value: '90' satisfies StatPeriod },
          { name: 'Career', value: 'career' satisfies StatPeriod },
        )
        .setRequired(true),
    )
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

    if (period === 'career') {
      stats = accountInfo[id].statistics.all;
    } else {
      const daysAgo = period === 'today' ? 0 : Number(period) - 1;
      const periodStart = new Date();

      periodStart.setDate(periodStart.getDate() - daysAgo);
      periodStart.setHours(5, 0, 0, 0);

      stats = sumStats(
        Object.entries(
          await getTankStatsOverTime(
            server,
            id,
            periodStart.getTime() / 1000,
            new Date().getTime() / 1000,
          ),
        ).map(([, stats]) => stats),
      );
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
          <GenericStats
            stats={[
              [
                'Winrate',
                `${(100 * (stats.wins / stats.battles)).toFixed(2)}%`,
              ],
              // ['WN8', stats.wn8.toFixed(0)],
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
              // ['Average tier', stats.avg_tier.toFixed(2)],
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

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
