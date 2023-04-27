import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { TanksStats } from '../types/tanksStats.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getWargamingResponse from '../utilities/getWargamingResponse.js';
import { tankTypeEmojis, tankopedia } from '../utilities/tankopedia.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('tanks')
    .setDescription("Shows a player's owned tanks")
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('The Blitz server you are in')
        .setRequired(true)
        .addChoices(
          { name: BLITZ_SERVERS.com, value: 'com' },
          { name: BLITZ_SERVERS.eu, value: 'eu' },
          { name: BLITZ_SERVERS.asia, value: 'asia' },
        ),
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The username you use in Blitz')
        .setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName('tier')
        .setDescription('The tier you want to see (default: all tiers)')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true),
    ),

  execute(interaction) {
    const server = interaction.options.getString('server') as BlitzServer;
    const name = interaction.options.getString('name')!;
    const tier = Math.round(interaction.options.getNumber('tier')!);

    getBlitzAccount(interaction, name, server, async (account) => {
      getWargamingResponse<TanksStats>(
        `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${process.env.WARGAMING_APPLICATION_ID}&account_id=${account.account_id}`,
        interaction,
        async (tankStats) => {
          const tanks = tankStats[account.account_id]!.map(
            (tankData) => tankopedia.data[tankData.tank_id],
          ).filter((tank) => tank.tier === tier);

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(
                  `${account.nickname}'s owned ${
                    tier === null ? '' : `tier ${tier} `
                  }tanks`,
                )
                .setDescription(
                  tanks.length === 0
                    ? `No tanks found for player in tier ${tier}`
                    : tanks
                        .map(
                          (tank) =>
                            `${tankTypeEmojis[tank.type]} ${tank.name} ${
                              tank.is_premium ? '⭐' : ''
                            }`,
                        )
                        .join('\n'),
                )
                .setColor(SKILLED_COLOR),
            ],
          });

          console.log(
            `Displaying ${account.nickname}'s owned tanks in tier ${tier}`,
          );
        },
      );
    });
  },
} satisfies CommandRegistry;
