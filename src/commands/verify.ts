import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import { NEGATIVE_COLOR, POSITIVE_COLOR } from '../constants/colors.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('verify'))
    .setDescription("Set's the user's username to their in-game name")
    .addStringOption((option) => addUsernameOption(option).setRequired(true)),

  async execute(interaction) {
    const blitzAccount = await getBlitzAccount(interaction);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${args['wargaming-application-id']}&account_id=${id}&extra=clan`,
    );
    const clan = clanData[id]?.clan;
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

      return;
    }

    if (interaction.member) {
      const member = interaction.guild?.members.cache.get(
        interaction.member?.user.id,
      );

      if (member) {
        try {
          await member.setNickname(`${accountInfo[id].nickname}${clanTag}`);

          if (interaction.guildId === discord.sklld_guild_id) {
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

              return;
            }

            await member.roles.remove(discord.sklld_verify_role);
            await member.roles.add(discord.sklld_peasant_role);
          }

          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(POSITIVE_COLOR)
                .setTitle(`${interaction.user.username} is verified`)
                .setDescription(
                  `The user is now verified as ${markdownEscape(
                    accountInfo[id].nickname,
                  )}${markdownEscape(clanTag)}`,
                ),
            ],
          });
        } catch (error) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(NEGATIVE_COLOR)
                .setTitle(`${interaction.user.username} failed to verify`)
                .setDescription(
                  "I can't change your nickname because you have higher permissions than me. Try setting your nickname to your Blitz username manually.",
                ),
            ],
          });
        }
      }
    }
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
