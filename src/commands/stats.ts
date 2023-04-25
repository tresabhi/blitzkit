import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import blitzLinks from '../utilities/blitzLinks.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getBlitzStarsAccount from '../utilities/getBlitzStarsAccount.js';
import poweredByBlitzStars from '../utilities/poweredByBlitzStars.js';

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  const ign = interaction.options.getString('ign')!;
  const server = interaction.options.getString('server') as BlitzServer;
  const period = interaction.options.getString('period')! as
    | '30'
    | '90'
    | 'career';

  getBlitzAccount(interaction, ign, server, async (account) => {
    getBlitzStarsAccount(interaction, account.account_id, ign, async (data) => {
      {
        const stats =
          period === 'career' ? data.statistics : data[`period${period}d`];

        await interaction.reply({
          embeds: [
            poweredByBlitzStars(
              new EmbedBuilder()
                .setColor(SKILLED_COLOR)
                .setTitle(
                  `${data.nickname}'s ${
                    period === 'career' ? period : `${period} day`
                  } stats`,
                )
                .setDescription(
                  `${[
                    ['Winrate', `${stats.special.winrate.toFixed(2)}%`],
                    ['Survival', `${stats.special.survivalRate.toFixed(2)}%`],
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
                    ['Hits per battle', stats.special.hpb.toFixed(2)],
                    ['Damage per battle', stats.special.dpb.toFixed(0)],
                    ['Kills per battle', stats.special.kpb.toFixed(2)],
                    ['Spots per battle', stats.special.spb.toFixed(2)],
                    [
                      'Shots per battle',
                      (stats.all.shots / stats.all.battles).toFixed(2),
                    ],
                    [
                      'Hits per battle',
                      (stats.all.hits / stats.all.battles).toFixed(2),
                    ],
                    [
                      'XP per battle',
                      (stats.all.xp / stats.all.battles).toFixed(0),
                    ],
                    [],
                    ['Damage ratio', stats.special.damageRatio.toFixed(2)],
                    ['Kills to death ratio', stats.special.kdr.toFixed(2)],
                  ]
                    .map((array) =>
                      array.length === 0 ? '' : `**${array[0]}**: ${array[1]}`,
                    )
                    .join('\n')}\n\n${blitzLinks(data)}`,
                ),
            ),
          ],
        });

        console.log(`Showing ${data.nickname}'s ${period} stats`);
      }
    });
  });
}

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription("Gets the user's in-game statistics")
  .addStringOption((option) =>
    option
      .setName('period')
      .setDescription('The last number of days of stats')
      .setChoices(
        { name: '30 Days', value: '30' },
        { name: '90 Days', value: '90' },
        { name: 'Career', value: 'career' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('server')
      .setDescription('The Blitz server you are in')
      .addChoices(
        { name: BLITZ_SERVERS.com, value: 'com' },
        { name: BLITZ_SERVERS.eu, value: 'eu' },
        { name: BLITZ_SERVERS.asia, value: 'asia' },
      )
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('ign')
      .setDescription('The username you use in Blitz')
      .setRequired(true),
  );
