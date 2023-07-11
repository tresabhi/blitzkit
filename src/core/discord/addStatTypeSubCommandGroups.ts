import { SlashCommandBuilder } from 'discord.js';
import addPeriodSubCommands from './addPeriodSubCommands';
import addTankChoices from './addTankChoices';
import addUsernameChoices from './addUsernameChoices';

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
