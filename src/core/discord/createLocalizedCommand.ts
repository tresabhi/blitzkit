import { Locale, SlashCommandBuilder } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

interface CreateLocalizedCommandSubcommand {
  subcommand: string;
}

export function createLocalizedCommand(
  command: string,
  subcommands?: CreateLocalizedCommandSubcommand[],
) {
  const { translate } = translator(Locale.EnglishUS);
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setNameLocalizations(localizationObject(`bot.commands.${command}`))
    .setDescription(translate(`bot.commands.${command}.description`))
    .setDescriptionLocalizations(
      localizationObject(`bot.commands.${command}.description`),
    );

  if (subcommands) {
    subcommands.map(({ subcommand }) => {
      const subcommandNameLocalizations = localizationObject(
        `bot.commands.${command}.subcommands.${subcommand}`,
      );
      const subcommandDescriptionLocalizations = localizationObject(
        `bot.commands.${command}.subcommands.${subcommand}.description`,
      );

      slashCommand.addSubcommand((option) =>
        option
          .setName(subcommand)
          .setNameLocalizations(subcommandNameLocalizations)
          .setDescription(
            translate(
              `bot.commands.${command}.subcommands.${subcommand}.description`,
            ),
          )
          .setDescriptionLocalizations(subcommandDescriptionLocalizations),
      );
    });
  }

  return slashCommand;
}
