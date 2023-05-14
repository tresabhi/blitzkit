import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { BlitzServer } from '../constants/servers.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import validateUsername from '../core/blitz/validateUsername.js';
import { tankopedia } from '../core/blitzstars/tankopedia.js';
import getPeriodicStats, {
  Period,
} from '../core/blitztankstats/getPeriodicStats.js';
import cleanTable from '../core/interaction/cleanTable.js';
import cmdName from '../core/interaction/cmdName.js';
import errorEmbed from '../core/interaction/errorEmbed.js';
import sklldEmbed from '../core/interaction/sklldEmbed.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addTankChoices from '../core/options/addTankChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import resolveTankName from '../utilities/resolveTankName.js';

type Periods = '30' | '60' | '90';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('tankstats'))
    .setDescription('Stats for a tank over a period')
    .addStringOption(addTankChoices)
    .addStringOption((option) =>
      option
        .setName('period')
        .setDescription('The period to get stats for')
        .setChoices(
          { name: '30 Days', value: '30' satisfies Periods },
          { name: '60 Days', value: '60' satisfies Periods },
          { name: '90 Days', value: '90' satisfies Periods },
        )
        .setRequired(true),
    )
    .addStringOption(addServerChoices)
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const server = interaction.options.getString('server') as BlitzServer;
    const name = interaction.options.getString('username')!;
    const tankId = interaction.options.getString('tank')!;
    const period = interaction.options.getString('period') as Periods;
    const blitzAccount = await validateUsername(interaction, name, server);
    if (!blitzAccount) return;
    const tank = tankopedia.data[tankId as unknown as number];

    if (tank) {
      const periodicStats = (
        await getPeriodicStats(blitzAccount.account_id, Number(period))
      )
        .filter((stats) => stats.tank_id === tank.tank_id)
        .filter((stats) => !stats.isRating);

      function sum(summer: (period: Period) => number) {
        return periodicStats.reduce(
          (accumulative, period) => accumulative + summer(period),
          0,
        );
      }
      function weighted(summer: (period: Period) => number) {
        return (
          periodicStats.reduce(
            (accumulative, period) =>
              accumulative + summer(period) * period.battles,
            0,
          ) / sum((period) => period.battles)
        );
      }

      interaction.editReply({
        embeds: [
          sklldEmbed(
            `${period} day stats for ${markdownEscape(
              blitzAccount.nickname,
            )}'s ${resolveTankName(tank)}`,
            periodicStats.length > 0
              ? cleanTable([
                  [
                    'Winrate',
                    `${(
                      100 *
                      (sum((a) => a.wins) / sum((a) => a.battles))
                    ).toFixed(2)}%`,
                  ],
                  [
                    'Survival',
                    `${(
                      100 *
                      (sum((a) => a.survived_battles) / sum((a) => a.battles))
                    ).toFixed(2)}%`,
                  ],
                  [
                    'Accuracy',
                    `${(
                      100 *
                      (sum((a) => a.hits) / sum((a) => a.shots))
                    ).toFixed(2)}%`,
                  ],
                  ['WN8', weighted((a) => a.wn8).toFixed(0)],
                  [],
                  ['Battles', sum((a) => a.battles)],
                  ['Wins', sum((a) => a.wins)],
                  ['Losses', sum((a) => a.losses)],
                  [],
                  [
                    'Shots per battle',
                    (sum((a) => a.shots) / sum((a) => a.battles)).toFixed(2),
                  ],
                  [
                    'Hits per battle',
                    (sum((a) => a.hits) / sum((a) => a.battles)).toFixed(2),
                  ],
                  [
                    'Damage per battle',
                    (
                      sum((a) => a.damage_dealt) / sum((a) => a.battles)
                    ).toFixed(0),
                  ],
                  [
                    'Kills per battle',
                    (sum((a) => a.frags) / sum((a) => a.battles)).toFixed(2),
                  ],
                  [
                    'Spots per battle',
                    (sum((a) => a.spotted) / sum((a) => a.battles)).toFixed(2),
                  ],
                  [
                    'XP per battle',
                    (sum((a) => a.xp) / sum((a) => a.battles)).toFixed(0),
                  ],
                  [],
                  [
                    'Damage ratio',
                    (
                      sum((a) => a.damage_dealt) / sum((a) => a.damage_received)
                    ).toFixed(2),
                  ],
                  [
                    'Kills to death ratio',
                    (
                      sum((a) => a.frags) /
                      sum((a) => a.battles - a.survived_battles)
                    ).toFixed(2),
                  ],
                ])
              : 'No battles were played or recorded during this period.',
          ),
        ],
      });
    } else {
      interaction.editReply({
        embeds: [
          errorEmbed(
            'Tank not found',
            `"${markdownEscape(tankId)}" does not exist in the game.`,
          ),
        ],
      });
    }
  },

  autocomplete: (interaction) => {
    tanksAutocomplete(interaction);
    usernameAutocomplete(interaction);
  },
} satisfies CommandRegistry;
