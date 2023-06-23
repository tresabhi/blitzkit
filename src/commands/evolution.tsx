import { SlashCommandBuilder } from 'discord.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import addStatsSubCommandGroups from '../core/options/addStatsSubCommandGroups.js';
import resolvePeriod from '../core/options/resolvePeriod.js';
import resolvePlayer from '../core/options/resolvePlayer.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import evolution from '../renderers/evolution.js';
import { StatType } from '../renderers/stats.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: addStatsSubCommandGroups(
    new SlashCommandBuilder()
      .setName('evolution')
      .setDescription('Evolution of statistics'),
  ),

  async execute(interaction) {
    const commandGroup = interaction.options.getSubcommandGroup(
      true,
    ) as StatType;
    const player = await resolvePlayer(interaction);
    const period = resolvePeriod(interaction);
    const tankIdRaw = interaction.options.getString('tank')!;
    const tankId = commandGroup === 'tank' ? resolveTankId(tankIdRaw) : 0;

    return await evolution(commandGroup, period, player, tankId);

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
