import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { NATIONS } from '../blitzkit/tankDefinitions';
import { addFilterOptions } from './addFilterOptions';
import { addPeriodSubCommands } from './addPeriodSubCommands';

export default async function addPeriodicFilterOptions<
  OptionType extends SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
>(
  option: OptionType,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
): Promise<OptionType> {
  const nations = await NATIONS;
  addPeriodSubCommands(option, (option) =>
    addFilterOptions(extra(option), nations),
  );

  return option;
}
