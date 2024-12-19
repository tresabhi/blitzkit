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
  const commandPathItem = command.replaceAll('-', '_');
  const { translate } = translator(Locale.EnglishUS);
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setNameLocalizations(
      localizationObject(`bot.commands.${commandPathItem}`, undefined, true),
    )
    .setDescription(translate(`bot.commands.${commandPathItem}.description`))
    .setDescriptionLocalizations(
      localizationObject(`bot.commands.${commandPathItem}.description`),
    );

  if (sub) {
    sub.map((subItem) => {
      if ('subcommand' in subItem) {
        const subcommandNameLocalizations = localizationObject(
          `bot.commands.${commandPathItem}.subcommands.${subItem.subcommand}`,
          undefined,
          true,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          `bot.commands.${commandPathItem}.subcommands.${subItem.subcommand}.description`,
        );

        slashCommand.addSubcommand((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.subcommand)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              translate(
                `bot.commands.${commandPathItem}.subcommands.${subItem.subcommand}.description`,
              ),
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      } else {
        const subcommandNameLocalizations = localizationObject(
          `bot.commands.${commandPathItem}.groups.${subItem.group}`,
          undefined,
          true,
        );
        const subcommandDescriptionLocalizations = localizationObject(
          `bot.commands.${commandPathItem}.groups.${subItem.group}.description`,
        );

        slashCommand.addSubcommandGroup((option) => {
          if (subItem.modify) subItem.modify(option);

          return option
            .setName(subItem.group)
            .setNameLocalizations(subcommandNameLocalizations)
            .setDescription(
              translate(
                `bot.commands.${commandPathItem}.groups.${subItem.group}.description`,
              ),
            )
            .setDescriptionLocalizations(subcommandDescriptionLocalizations);
        });
      }
    });
  }

  return slashCommand;
}
