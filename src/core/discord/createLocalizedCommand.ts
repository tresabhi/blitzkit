import { Locale, SlashCommandBuilder } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

interface CreateLocalizedCommandSubcommand {
  subcommand: string;
}

export async function createLocalizedCommand(
  command: string,
  subcommands?: CreateLocalizedCommandSubcommand[],
) {
  const { translate } = await translator(Locale.EnglishUS);
  const slashCommand = new SlashCommandBuilder()
    .setName(command)
    .setNameLocalizations(await localizationObject(`bot.commands.${command}`))
    .setDescription(translate(`bot.commands.${command}.description`))
    .setDescriptionLocalizations(
      await localizationObject(`bot.commands.${command}.description`),
    );

  if (subcommands) {
    await Promise.all(
      subcommands.map(async ({ subcommand }) => {
        const subcommandNameLocalizations = await localizationObject(
          `bot.commands.${command}.subcommands.${subcommand}`,
        );
        const subcommandDescriptionLocalizations = await localizationObject(
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
      }),
    );
  }

  return slashCommand;
}
