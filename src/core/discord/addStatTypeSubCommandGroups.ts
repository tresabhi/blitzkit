import { SlashCommandBuilder } from 'discord.js';
import addPeriodSubCommands from './addPeriodSubCommands.js';
import addTankChoices from './addTankChoices.js';
import addUsernameChoices from './addUsernameChoices.js';

export default function addStatTypeSubCommandGroups(
  option: SlashCommandBuilder,
) {
  return option
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option.addStringOption(addUsernameChoices),
      )
        .setName('player')
        .setDescription("Player's statistics"),
    )
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameChoices),
      )
        .setName('tank')
        .setDescription("Tank's statistics"),
    );
}
