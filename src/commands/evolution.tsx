import { SlashCommandBuilder } from 'discord.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import addStatsSubCommandGroups from '../core/discord/addStatsSubCommandGroups.js';
import resolvePeriodFromCommand from '../core/discord/resolvePeriodFromCommand.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import tanksAutocomplete from '../core/discord/tanksAutocomplete.js';
import usernameAutocomplete from '../core/discord/usernameAutocomplete.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import evolution from '../renderers/evolution.js';
import { StatType } from '../renderers/stats.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: addStatsSubCommandGroups(
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
    usernameAutocomplete(interaction);
    tanksAutocomplete(interaction);
  },
} satisfies CommandRegistry;
