import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import { BlitzServer } from '../constants/servers.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import validateUsername from '../core/blitz/validateUsername.js';
import cmdName from '../core/interaction/cmdName.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('verify'))
    .setDescription("Set's the user's username to their in-game name")
    .addStringOption(addServerChoices)
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const name = interaction.options.getString('username')!;
    const server = interaction.options.getString('server') as BlitzServer;
    const account = await validateUsername(interaction, name, server);
    if (!account) return;
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${account.account_id}&extra=clan`,
    );
    if (!clanData) return;
    const clan = clanData[account.account_id]?.clan;
    const clanTag = clan ? ` [${clan!.tag}]` : '';

    if (!interaction.guild?.members.me?.permissions.has('ManageNicknames')) {
      interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(NEGATIVE_COLOR)
            .setTitle(
              `${markdownEscape(interaction.user.username)} failed to verify`,
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
        try {
          await member.setNickname(`${account.nickname}${clanTag}`);

          if (interaction.guildId === discord.guild_id) {
            if (
              !interaction.guild?.members.me?.permissions.has('ManageRoles')
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
                    account.nickname,
                  )}${markdownEscape(clanTag)}`,
                ),
            ],
          });

          console.log(
            `${interaction.user.username} verified as ${account.nickname}${clanTag}`,
          );
        } catch (error) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(NEGATIVE_COLOR)
                .setTitle(`${interaction.user.username} failed to verify`)
                .setDescription(
                  "I can't change your nickname because you have higher permissions than me.",
                ),
            ],
          });

          console.warn('Failed to verify because of higher permissions.');
        }
      }
    }
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
