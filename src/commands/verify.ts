import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS_SHORT, BlitzServer } from '../constants/servers.js';
import { PlayerClanData } from '../types/playerClanData.js';
import addIGNOption from '../utilities/addIGNOption.js';
import addServerChoices from '../utilities/addServerChoices.js';
import { args } from '../utilities/args.js';
import getBlitzAccount from '../utilities/getBlitzAccount.js';
import getWargamingResponse from '../utilities/getWargamingResponse.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('verifydev')
    .setDescription("Set's the user's username to their in-game name")
    .addStringOption((option) => addServerChoices(option).setRequired(true))
    .addStringOption((Option) => addIGNOption(Option).setRequired(true)),

  execute(interaction) {
    let name = interaction.options.getString('name')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const command = `verify ${server} ${name}`;

    getBlitzAccount(interaction, command, name, server, async (account) => {
      name = account.nickname;

      getWargamingResponse<PlayerClanData>(
        `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${account.account_id}&extra=clan`,
        interaction,
        command,
        async (clanData) => {
          const clan = clanData[account.account_id].clan;
          const clanTag = clan === null ? '' : ` [${clan!.tag}]`;

          if (
            !interaction.guild?.members.me?.permissions.has('ManageNicknames')
          ) {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(NEGATIVE_COLOR)
                  .setTitle(
                    `${markdownEscape(
                      interaction.user.username,
                    )} failed to verify`,
                  )
                  .setDescription(
                    "I don't have the permission to change your nickname.",
                  ),
              ],
            });

            console.warn(
              `${interaction.user.username} failed to verify because of no nickname permission.`,
            );

            return;
          }

          if (interaction.member) {
            const member = interaction.guild?.members.cache.get(
              interaction.member?.user.id,
            );

            if (member) {
              await member
                ?.setNickname(
                  `${name} (${BLITZ_SERVERS_SHORT[server]})${clanTag}`,
                )
                .then(async () => {
                  if (interaction.guildId === discord.guild_id) {
                    if (
                      !interaction.guild?.members.me?.permissions.has(
                        'ManageRoles',
                      )
                    ) {
                      await interaction.editReply({
                        embeds: [
                          new EmbedBuilder()
                            .setColor(NEGATIVE_COLOR)
                            .setTitle(
                              `${markdownEscape(
                                interaction.user.username,
                              )} failed to verify`,
                            )
                            .setDescription(
                              "I don't have the permission to change your manage roles.",
                            ),
                        ],
                      });

                      console.warn(
                        `${interaction.user.username} failed to verify because of no manage roles permission.`,
                      );

                      return;
                    }

                    await member.roles.remove(discord.verify_role);
                    await member.roles.add(discord.peasant_role);
                  }

                  await interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(POSITIVE_COLOR)
                        .setTitle(`${interaction.user.username} is verified`)
                        .setDescription(
                          `The user is now verified as ${markdownEscape(
                            name,
                          )} (${BLITZ_SERVERS_SHORT[server]})${markdownEscape(
                            clanTag,
                          )}`,
                        ),
                    ],
                  });

                  console.log(
                    `${interaction.user.username} verified as ${name} (${BLITZ_SERVERS_SHORT[server]})${clanTag}`,
                  );
                })
                .catch(async () => {
                  await interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(NEGATIVE_COLOR)
                        .setTitle(
                          `${interaction.user.username} failed to verify`,
                        )
                        .setDescription(
                          "I can't change your nickname because you have higher permissions than me.",
                        ),
                    ],
                  });

                  console.warn(
                    'Failed to verify because of higher permissions.',
                  );
                });
            }
          }
        },
      );
    });
  },
} satisfies CommandRegistry;
