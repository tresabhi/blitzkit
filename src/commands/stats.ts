import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import blitzStarsLinks from '../core/blitzstars/blitzStarsLinks.js';
import getBlitzStarsAccount from '../core/blitzstars/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../core/blitzstars/poweredByBlitzStars.js';
import cleanTable from '../core/interaction/cleanTable.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { AccountInfo, AllStats } from '../types/accountInfo.js';
import { BlitzStartsComputedPeriodicStatistics } from '../types/statistics.js';

type Period = 'today' | '30' | '90' | 'career';

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
    const blitzStarsAccount = await getBlitzStarsAccount(interaction, id);
    if (!blitzStarsAccount) return;

    if (period === 'today') {
      const a1 = blitzStarsAccount.statistics;
      const a2 = accountInfo[id].statistics;
      const battles = a2.all.battles - a1.all.battles;

      function pb(value: (allStats: AllStats) => number) {
        return (value(a2.all) - value(a1.all)) / battles;
      }
      function diff(value: (allStats: AllStats) => number) {
        return value(a2.all) - value(a1.all);
      }

      stats = {
        all: {
          battles,
          capture_points: pb((a) => a.capture_points),
          damage_dealt: pb((a) => a.damage_dealt),
          damage_received: pb((a) => a.damage_received),
          dropped_capture_points: diff((a) => a.dropped_capture_points),
          frags: pb((a) => a.frags),
          frags8p: pb((a) => a.frags8p),
          hits: diff((a) => a.hits),
          losses: diff((a) => a.losses),
          max_frags: pb((a) => a.max_frags),
          max_frags_tank_id: pb((a) => a.max_frags_tank_id),
          max_xp: pb((a) => a.max_xp),
          max_xp_tank_id: pb((a) => a.max_xp_tank_id),
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
    if (!stats!) return;

    await interaction.editReply({
      embeds: [
        poweredByBlitzStars(
          new EmbedBuilder()
            .setColor(SKILLED_COLOR)
            .setTitle(
              `${markdownEscape(blitzStarsAccount.nickname)}'s ${
                period === 'career'
                  ? period
                  : `${period === 'today' ? 'today' : `${period} day`}`
              } stats`,
            )
            .setDescription(
              stats.all.battles > 0
                ? `${
                    period === 'today'
                      ? '**⚠ "Today" stats are in development. Some stats are not available/wrong.**\n\n'
                      : ''
                  }${cleanTable([
                    [
                      'Winrate',
                      `${(100 * (stats.all.wins / stats.all.battles)).toFixed(
                        2,
                      )}%`,
                    ],
                    [
                      'Survival',
                      `${(
                        100 *
                        (stats.all.survived_battles / stats.all.battles)
                      ).toFixed(2)}%`,
                    ],
                    [
                      'Accuracy',
                      `${((stats.all.hits / stats.all.shots) * 100).toFixed(
                        2,
                      )}%`,
                    ],
                    ['WN8', stats.wn8.toFixed(0)],
                    ['WN7', stats.wn7.toFixed(0)],
                    [],
                    ['Battles', stats.all.battles],
                    ['Wins', stats.all.wins],
                    ['Losses', stats.all.losses],
                    ['Average tier', stats.avg_tier.toFixed(2)],
                    [],
                    [
                      'Shots per battle',
                      (stats.all.shots / stats.all.battles).toFixed(2),
                    ],
                    [
                      'Hits per battle',
                      (stats.all.hits / stats.all.battles).toFixed(2),
                    ],
                    [
                      'Damage per battle',
                      (stats.all.damage_dealt / stats.all.battles).toFixed(0),
                    ],
                    [
                      'Kills per battle',
                      (stats.all.frags / stats.all.battles).toFixed(2),
                    ],
                    [
                      'Spots per battle',
                      (stats.all.spotted / stats.all.battles).toFixed(2),
                    ],
                    [
                      'XP per battle',
                      (stats.all.xp / stats.all.battles).toFixed(0),
                    ],
                    [],
                    [
                      'Damage ratio',
                      (
                        stats.all.damage_dealt / stats.all.damage_received
                      ).toFixed(2),
                    ],
                    [
                      'Kills to death ratio',
                      (
                        stats.all.frags /
                        (stats.all.battles - stats.all.survived_battles)
                      ).toFixed(2),
                    ],
                  ])}\n\n${blitzStarsLinks(server, blitzStarsAccount.nickname)}`
                : 'No battles played in this period.',
            ),
        ),
      ],
    });

    console.log(`Showing stats for ${blitzStarsAccount.nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
