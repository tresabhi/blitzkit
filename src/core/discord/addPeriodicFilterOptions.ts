import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { encyclopediaInfo } from '../blitz/encyclopediaInfo';
import { addFilterOptions } from './addFilterOptions';
import addPeriodSubCommands from './addPeriodSubCommands';

export default async function addPeriodicFilterOptions<
  OptionType extends SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
>(
  option: OptionType,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
): Promise<OptionType> {
  const awaitedEncyclopediaInfo = await encyclopediaInfo;

  addPeriodSubCommands(option, (option) => {
    return addFilterOptions(extra(option), awaitedEncyclopediaInfo);
  });

  return option;
}
