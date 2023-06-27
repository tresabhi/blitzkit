import { SlashCommandBuilder } from 'discord.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import addStatTypeSubCommandGroups from '../core/discord/addStatTypeSubCommandGroups.js';
import autocompleteTanks from '../core/discord/autocompleteTanks.js';
import autocompleteUsername from '../core/discord/autocompleteUsername.js';
import resolvePeriodFromCommand from '../core/discord/resolvePeriodFromCommand.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import evolution from '../renderers/evolution.js';
import { StatType } from '../renderers/stats.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: addStatTypeSubCommandGroups(
    new SlashCommandBuilder()
      .setName('evolution')
      .setDescription('Evolution of statistics'),
  ),

  async handler(interaction) {
    const commandGroup = interaction.options.getSubcommandGroup(
      true,
    ) as StatType;
    const player = await resolvePlayerFromCommand(interaction);
    const period = resolvePeriodFromCommand(interaction);
    const tankIdRaw = interaction.options.getString('tank')!;
    const tankId = commandGroup === 'tank' ? resolveTankId(tankIdRaw) : 0;

    return await evolution(commandGroup, period, player, tankId);

    // TODO: implement this
    // new ButtonBuilder()
    //   .setStyle(ButtonStyle.Link)
    //   .setLabel('View on BlitzStars')
    //   .setURL(
    //     commandGroup === 'tank'
    //       ? `https://www.blitzstars.com/player/com/${
    //           accountInfo[id].nickname
    //         }/tank/${tankId!}`
    //       : `https://www.blitzstars.com/player/com/${accountInfo[id].nickname}`,
    //   );
  },

  autocomplete: (interaction) => {
    autocompleteUsername(interaction);
    autocompleteTanks(interaction);
  },
} satisfies CommandRegistry;
