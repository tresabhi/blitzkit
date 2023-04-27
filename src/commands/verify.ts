import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import discord from '../../discord.json' assert { type: 'json' };
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getWargamingResponse from '../utilities/getWargamingResponse.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: false,

  command: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifies the user with Blitz')
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
    ),

  execute(interaction) {
    const name = interaction.options.getString('name')!;
    const server = interaction.options.getString('server') as BlitzServer;

    getBlitzAccount(interaction, name, server, async (account) => {
      getWargamingResponse<PlayerClanData>(
        `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${process.env.WARGAMING_APPLICATION_ID}&account_id=${account.account_id}&extra=clan`,
        interaction,
        async (clanData) => {
          const clan = clanData[account.account_id].clan;
          const clanTag = clan === null ? '' : ` [${clan!.tag}]`;

          if (interaction.member && interaction.guild) {
            const member = interaction.guild?.members.cache.get(
              interaction.member?.user.id,
            );

            member
              ?.setNickname(`${name}${clanTag}`)
              .then(async () => {
                await member.roles.remove(discord.verify_role);
                await member.roles.add(discord.peasant_role);
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(POSITIVE_COLOR)
                      .setTitle(`${interaction.user.username} is verified`)
                      .setDescription(
                        `The user is now verified as ${name}${clanTag}`,
                      ),
                  ],
                });

                console.log(
                  `${interaction.user.username} verified as ${name}${clanTag}`,
                );
              })
              .catch(async () => {
                await interaction.reply({
                  embeds: [
                    new EmbedBuilder()
                      .setColor(NEGATIVE_COLOR)
                      .setTitle(`${interaction.user.username} failed to verify`)
                      .setDescription(
                        'I may not have the permission to change your nickname.',
                      ),
                  ],
                });

                console.warn(
                  `${interaction.user.username} failed to verify as ${name}${clanTag}`,
                );
              });
          }
        },
      );
    });
  },
} satisfies CommandRegistry;
