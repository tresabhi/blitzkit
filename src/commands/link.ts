import { SlashCommandBuilder } from 'discord.js';
import { Region } from '../constants/regions';
import { linkBlitzAndDiscord } from '../core/cockroackdb/discordBlitz';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedNegative from '../core/discord/embedNegative';
import { CommandRegistry } from '../events/interactionCreate';

const serverAndIdPattern = /(com|eu|asia)\/[0-9]+/;

export const verifyCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your Blitz and Discord account')
    .addStringOption((option) => addUsernameChoices(option).setRequired(true)),

  async handler(interaction) {
    // const blitzAccount = await resolvePlayerFromCommand(interaction);
    // const { id, region: server } = blitzAccount;
    // const accountInfo = await getWargamingResponse<AccountInfo>(
    //   `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    // );
    // const clanData = await getWargamingResponse<PlayerClanData>(
    //   `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    // );
    // const clan = clanData[id]?.clan;
    // const clanTag = clan ? ` [${clan!.tag}]` : '';
    // const member =
    //   interaction.member &&
    //   interaction.guild?.members.cache.get(interaction.member?.user.id);

    // if (!interaction.guild?.members.me?.permissions.has('ManageNicknames')) {
    //   return embedNegative(
    //     `${markdownEscape(interaction.user.username)} failed to verify`,
    //     "I don't have the permission to change your nickname.",
    //   );
    // }
    // if (!interaction.member || !member) {
    //   return embedNegative(
    //     `${interaction.user.username} is not in this server`,
    //     "I couldn't find this person in this server. Did they leave?",
    //   );
    // }

    // try {
    //   await member.setNickname(`${accountInfo[id].nickname}${clanTag}`);

    //   if (interaction.guildId === discord.sklld_guild_id) {
    //     if (!interaction.guild?.members.me?.permissions.has('ManageRoles')) {
    //       return embedNegative(
    //         `${markdownEscape(interaction.user.username)} failed to verify`,
    //         "I don't have the permission to change your manage roles.",
    //       );
    //     }

    //     await member.roles.remove(discord.sklld_verify_role);
    //     await member.roles.add(discord.sklld_peasant_role);
    //   }

    //   return embedPositive(
    //     `${interaction.user.username} is verified`,
    //     `The user is now verified as ${markdownEscape(
    //       accountInfo[id].nickname,
    //     )}${markdownEscape(clanTag)}`,
    //   );
    // } catch (error) {
    //   return embedNegative(
    //     `${interaction.user.username} failed to verify`,
    //     "I can't change your nickname because you have higher permissions than me. Try setting your nickname to your Blitz username manually.",
    //   );
    // }

    const username = interaction.options.getString('username', true);

    if (serverAndIdPattern.test(username)) {
      const [region, idString] = username.split('/');
      const id = parseInt(idString);
      const discordId = parseInt(interaction.user.id);

      await linkBlitzAndDiscord(discordId, region as Region, id);

      return 'success';
    } else {
      return [
        embedNegative(
          'Please select from the options',
          'Click on the user you desire after the search results show up (like the image below).',
        ),
        'https://i.imgur.com/ncJyV1F.png',
      ];
    }
  },

  autocomplete: autocompleteUsername,
};
