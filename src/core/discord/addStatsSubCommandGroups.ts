import { SlashCommandBuilder } from 'discord.js';
import addPeriodSubCommands from './addPeriodSubCommands.js';
import addTankChoices from './addTankChoices.js';
import addUsernameOption from './addUsernameOption.js';

export default function addStatsSubCommandGroups(option: SlashCommandBuilder) {
  return option
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option.addStringOption(addUsernameOption),
      )
        .setName('player')
        .setDescription("Player's statistics"),
    )
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameOption),
      )
        .setName('tank')
        .setDescription("Tank's statistics"),
    );
}
