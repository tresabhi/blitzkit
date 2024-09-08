import { gameDefinitions } from '@blitzkit/core';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { addFilterOptions } from './addFilterOptions';
import { addPeriodSubCommands } from './addPeriodSubCommands';

export async function addPeriodicFilterOptions<
  OptionType extends SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
>(
  option: OptionType,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
): Promise<OptionType> {
  const awaitedGameDefinitions = await gameDefinitions;

  addPeriodSubCommands(option, (option) =>
    addFilterOptions(extra(option), awaitedGameDefinitions.nations),
  );

  return option;
}
