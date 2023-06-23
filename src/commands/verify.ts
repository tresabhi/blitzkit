import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import usernameAutocomplete from '../core/autocomplete/username.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import negativeEmbed from '../core/interaction/negativeEmbed.js';
import positiveEmbed from '../core/interaction/positiveEmbed.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import resolvePlayer from '../core/options/resolvePlayer.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('verify')
    .setDescription("Set's the user's username to their in-game name")
    .addStringOption((option) => addUsernameOption(option).setRequired(true)),

  async execute(interaction) {
    const blitzAccount = await resolvePlayer(interaction);
    const { id, server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    );
    const clan = clanData[id]?.clan;
    const clanTag = clan ? ` [${clan!.tag}]` : '';
    const member =
      interaction.member &&
      interaction.guild?.members.cache.get(interaction.member?.user.id);

    if (!interaction.guild?.members.me?.permissions.has('ManageNicknames')) {
      return negativeEmbed(
        `${markdownEscape(interaction.user.username)} failed to verify`,
        "I don't have the permission to change your nickname.",
      );
    }
    if (!interaction.member || !member) {
      return negativeEmbed(
        `${interaction.user.username} is not in this server`,
        "I couldn't find this person in this server. Did they leave?",
      );
    }

    try {
      await member.setNickname(`${accountInfo[id].nickname}${clanTag}`);

      if (interaction.guildId === discord.sklld_guild_id) {
        if (!interaction.guild?.members.me?.permissions.has('ManageRoles')) {
          return negativeEmbed(
            `${markdownEscape(interaction.user.username)} failed to verify`,
            "I don't have the permission to change your manage roles.",
          );
        }

        await member.roles.remove(discord.sklld_verify_role);
        await member.roles.add(discord.sklld_peasant_role);
      }

      return positiveEmbed(
        `${interaction.user.username} is verified`,
        `The user is now verified as ${markdownEscape(
          accountInfo[id].nickname,
        )}${markdownEscape(clanTag)}`,
      );
    } catch (error) {
      return negativeEmbed(
        `${interaction.user.username} failed to verify`,
        "I can't change your nickname because you have higher permissions than me. Try setting your nickname to your Blitz username manually.",
      );
    }
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;
