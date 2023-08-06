import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import discord from '../../discord.json' assert { type: 'json' };
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedNegative from '../core/discord/embedNegative';
import embedPositive from '../core/discord/embedPositive';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { CommandRegistry } from '../events/interactionCreate';
import { AccountInfo } from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';

export const verifyCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('verify')
    .setDescription("Set's the user's username to their in-game name")
    .addStringOption((option) => addUsernameChoices(option).setRequired(true)),

  async handler(interaction) {
    const blitzAccount = await resolvePlayerFromCommand(interaction);
    const { id, region: server } = blitzAccount;
    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const clanData = await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    );
    const clan = clanData[id]?.clan;
    const clanTag = clan ? ` [${clan!.tag}]` : '';
    const member =
      interaction.member &&
      interaction.guild?.members.cache.get(interaction.member?.user.id);

    if (!interaction.guild?.members.me?.permissions.has('ManageNicknames')) {
      return embedNegative(
        `${markdownEscape(interaction.user.username)} failed to verify`,
        "I don't have the permission to change your nickname.",
      );
    }
    if (!interaction.member || !member) {
      return embedNegative(
        `${interaction.user.username} is not in this server`,
        "I couldn't find this person in this server. Did they leave?",
      );
    }

    try {
      await member.setNickname(`${accountInfo[id].nickname}${clanTag}`);

      if (interaction.guildId === discord.sklld_guild_id) {
        if (!interaction.guild?.members.me?.permissions.has('ManageRoles')) {
          return embedNegative(
            `${markdownEscape(interaction.user.username)} failed to verify`,
            "I don't have the permission to change your manage roles.",
          );
        }

        await member.roles.remove(discord.sklld_verify_role);
        await member.roles.add(discord.sklld_peasant_role);
      }

      return embedPositive(
        `${interaction.user.username} is verified`,
        `The user is now verified as ${markdownEscape(
          accountInfo[id].nickname,
        )}${markdownEscape(clanTag)}`,
      );
    } catch (error) {
      return embedNegative(
        `${interaction.user.username} failed to verify`,
        "I can't change your nickname because you have higher permissions than me. Try setting your nickname to your Blitz username manually.",
      );
    }
  },

  autocomplete: autocompleteUsername,
};
