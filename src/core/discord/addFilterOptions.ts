import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { TREE_TYPE_NAMES, TreeTypeString } from '../../components/Tanks';
import { encyclopediaInfo } from '../blitz/encyclopediaInfo';
import addPeriodSubCommands from './addPeriodSubCommands';
import addTankChoices from './addTankChoices';
import addTierChoices from './addTierChoices';

export default async function addFilterOptions<
  OptionType extends SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
>(
  option: OptionType,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
): Promise<OptionType> {
  const awaitedEncyclopediaInfo = await encyclopediaInfo;

  addPeriodSubCommands(option, (option) => {
    extra(option);

    return option
      .addStringOption((option) =>
        option
          .setName('nation')
          .setDescription('Nation')
          .addChoices(
            ...Object.entries(awaitedEncyclopediaInfo.vehicle_nations).map(
              ([type, name]) => ({ name, value: type }),
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) => addTierChoices(option).setRequired(false))
      .addStringOption((option) =>
        option
          .setName('tank-type')
          .setDescription('Tank type')
          .addChoices(
            ...Object.entries(awaitedEncyclopediaInfo.vehicle_types).map(
              ([type, name]) => ({
                name: name.replace(' Tank', ''),
                value: type,
              }),
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('tree-type')
          .setDescription('Tech tree type')
          .addChoices(
            {
              name: TREE_TYPE_NAMES['researchable'],
              value: 'researchable' satisfies TreeTypeString,
            },
            {
              name: TREE_TYPE_NAMES.premium,
              value: 'premium' satisfies TreeTypeString,
            },
            {
              name: TREE_TYPE_NAMES.collector,
              value: 'collector' satisfies TreeTypeString,
            },
          )
          .setRequired(false),
      )
      .addStringOption((option) => addTankChoices(option).setRequired(false));
  });

  return option;
}
