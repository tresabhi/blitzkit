import { SlashCommandBuilder } from 'discord.js';
import { CYCLIC_API } from '../constants/cyclic.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import interactionToURL from '../core/interaction/interactionToURL.js';
import linkButton from '../core/interaction/linkButton.js';
import primaryButton from '../core/interaction/primaryButton.js';
import resolvePeriodFromCommand from '../core/interaction/resolvePeriodFromCommand.js';
import { Period } from '../core/options/addPeriodSubCommands.js';
import addStatsSubCommandGroups from '../core/options/addStatsSubCommandGroups.js';
import resolvePlayer from '../core/options/resolvePlayer.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import stats, { StatType } from '../renderers/stats.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: addStatsSubCommandGroups(
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('In-game statistics'),
  ),

  async handler(interaction) {
    const commandGroup = interaction.options.getSubcommandGroup(
      true,
    ) as StatType;
    const subcommand = interaction.options.getSubcommand() as Period;
    const player = await resolvePlayer(interaction);
    const period = resolvePeriodFromCommand(interaction);
    const tankIdRaw = interaction.options.getString('tank')!;
    const tankId = commandGroup === 'tank' ? resolveTankId(tankIdRaw) : 0;
    const start = interaction.options.getInteger('start');
    const end = interaction.options.getInteger('end');
    const path = `stats/${commandGroup}/${subcommand}?server=${
      player.server
    }&id=${player.id}&tankId=${tankId}&start=${start ?? 0}&end=${end ?? 0}`;

    interactionToURL(interaction);

    return [
      await stats(commandGroup, period, player, tankId),
      primaryButton(path, 'Refresh'),
      linkButton(path, 'Embed'),
    ];
  },

  autocomplete: (interaction) => {
    usernameAutocomplete(interaction);
    tanksAutocomplete(interaction);
  },

  async button(interaction) {
    const url = new URL(`${CYCLIC_API}/${interaction.customId}`);
    const path = url.pathname.split('/').filter(Boolean);
    const commandGroup = path[1] as StatType;
    const period = resolvePeriodFromCommand(interaction);
    const player = await resolvePlayer(interaction);

    return await stats(
      commandGroup,
      period,
      player,
      parseInt(url.searchParams.get('tankId')!),
    );
  },
} satisfies CommandRegistry;
