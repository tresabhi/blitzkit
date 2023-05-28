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
import getBlitzStarsAccount from '../core/blitzstars/getBlitzStarsAccount.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import render from '../core/ui/render.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';
import { BlitzStartsComputedPeriodicStatistics } from '../types/statistics.js';

type Period = 'today' | '30' | '90' | 'career';

const periodNames: Record<Period, string> = {
  today: "Today's statistics",
  30: '30-day statistics',
  90: '90-day statistics',
  career: 'Career statistics',
};

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('stats'))
    .setDescription("Gets the user's in-game statistics")
    .addStringOption((option) =>
      option
        .setName('period')
        .setDescription('The last number of days of stats')
        .setChoices(
          { name: 'Today', value: 'today' satisfies Period },
          { name: '30 Days', value: '30' satisfies Period },
          { name: '90 Days', value: '90' satisfies Period },
          { name: 'Career', value: 'career' satisfies Period },
        )
        .setRequired(true),
    )
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const period = interaction.options.getString('period') as Period;
    const username = interaction.options.getString('username')!;
    const blitzAccount = await getBlitzAccount(interaction, username);
    if (!blitzAccount) return;
    const { id, server } = blitzAccount;
    let stats: BlitzStartsComputedPeriodicStatistics;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    if (!accountInfo) return;
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${id}&extra=clan`,
    );
    if (!clanData) return;
    const blitzStarsAccount = await getBlitzStarsAccount(interaction, id);
    if (!blitzStarsAccount) return;

    if (period === 'today') {
      const a1 = blitzStarsAccount.statistics;
      const a2 = accountInfo[id].statistics;
      const battles = a2.all.battles - a1.all.battles;

      function max(value: (allStats: AllStats) => number) {
        return Math.max(value(a2.all), value(a1.all));
      }
      function diff(value: (allStats: AllStats) => number) {
        return value(a2.all) - value(a1.all);
      }

      stats = {
        all: {
          battles,
          capture_points: diff((a) => a.capture_points),
          damage_dealt: diff((a) => a.damage_dealt),
          damage_received: diff((a) => a.damage_received),
          dropped_capture_points: diff((a) => a.dropped_capture_points),
          frags: diff((a) => a.frags),
          frags8p: diff((a) => a.frags8p),
          hits: diff((a) => a.hits),
          losses: diff((a) => a.losses),
          max_frags: max((a) => a.max_frags),
          max_xp: max((a) => a.max_xp),
          shots: diff((a) => a.shots),
          spotted: diff((a) => a.spotted),
          survived_battles: diff((a) => a.survived_battles),
          win_and_survived: diff((a) => a.win_and_survived),
          wins: diff((a) => a.wins),
          xp: diff((a) => a.xp),
        },
        avg_tier: -Infinity,
        wn7: -Infinity,
        wn8: -Infinity,
      };
    } else {
      stats =
        period === 'career'
          ? blitzStarsAccount.statistics
          : blitzStarsAccount[`period${period}d`];
    }
    if (!stats) return;

    const image = await render(
      <Wrapper>
        <TitleBar
          name={blitzStarsAccount.nickname}
          nameDiscriminator={
            clanData[id]?.clan ? `[${clanData[id]?.clan?.tag}]` : undefined
          }
          image={
            clanData[id]?.clan
              ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
              : undefined
          }
          description={`${
            periodNames[period]
          } • ${new Date().toDateString()} • ${BLITZ_SERVERS[server]}`}
        />

        {stats.all.battles === 0 && <NoBattlesInPeriod />}
        {stats.all.battles > 0 && (
          <GenericStats
            stats={[
              [
                'Winrate',
                `${(100 * (stats.all.wins / stats.all.battles)).toFixed(2)}%`,
              ],
              ['WN8', stats.wn8.toFixed(0)],
              [
                'Survival',
                `${(
                  100 *
                  (stats.all.survived_battles / stats.all.battles)
                ).toFixed(2)}%`,
              ],
              [
                'Accuracy',
                `${((stats.all.hits / stats.all.shots) * 100).toFixed(2)}%`,
              ],
              ['Battles', stats.all.battles],
              ['Wins', stats.all.wins],
              ['Losses', stats.all.losses],
              [
                'Average damage',
                (stats.all.damage_dealt / stats.all.battles).toFixed(0),
              ],
              ['Average XP', (stats.all.xp / stats.all.battles).toFixed(0)],
              [
                'Average shots',
                (stats.all.shots / stats.all.battles).toFixed(2),
              ],
              ['Average hits', (stats.all.hits / stats.all.battles).toFixed(2)],
              [
                'Average kills',
                (stats.all.frags / stats.all.battles).toFixed(2),
              ],
              [
                'Average spots',
                (stats.all.spotted / stats.all.battles).toFixed(2),
              ],
              ['Average tier', stats.avg_tier.toFixed(2)],
              [
                'Damage ratio',
                (stats.all.damage_dealt / stats.all.damage_received).toFixed(2),
              ],
              [
                'Kills to death ratio',
                (
                  stats.all.frags /
                  (stats.all.battles - stats.all.survived_battles)
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

    console.log(`Showing stats for ${blitzStarsAccount.nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
