import {
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

interface CreateLocalizedCommandSubcommand {
  subcommand: string;
  modify?: (option: SlashCommandSubcommandBuilder) => void;
}

interface CreateLocalizedCommandSubcommandGroup {
  group: string;
  modify?: (option: SlashCommandSubcommandGroupBuilder) => void;
}

export function createLocalizedCommand(
  command: string,
  sub?:
    | CreateLocalizedCommandSubcommand[]
    | CreateLocalizedCommandSubcommandGroup[],
) {
  const { translate } = translator(Locale.EnglishUS);
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setNameLocalizations(localizationObject(`bot.commands.${command}`))
    .setDescription(translate(`bot.commands.${command}.description`))
    .setDescriptionLocalizations(
      localizationObject(`bot.commands.${command}.description`),
    );

  if (sub) {
    sub.map((subItem) => {
      if ('subcommand' in subItem) {
        const subcommandNameLocalizations = localizationObject(
          `bot.commands.${command}.subcommands.${subItem.subcommand}`,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          `bot.commands.${command}.subcommands.${subItem.subcommand}.description`,
        );

        slashCommand.addSubcommand((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.subcommand)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              translate(
                `bot.commands.${command}.subcommands.${subItem.subcommand}.description`,
              ),
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      } else {
        const subcommandNameLocalizations = localizationObject(
          `bot.commands.${command}.groups.${subItem.group}`,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          `bot.commands.${command}.groups.${subItem.group}.description`,
        );

        slashCommand.addSubcommandGroup((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.group)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              translate(
                `bot.commands.${command}.groups.${subItem.group}.description`,
              ),
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      }
    });
  }

  return slashCommand;
}
