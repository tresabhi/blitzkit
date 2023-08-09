import { SlashCommandBuilder } from 'discord.js';
import { TreeTypeString } from '../../components/Tanks';
import { StatType } from '../../renderers/stats';
import { tankopediaInfo } from '../blitz/tankopedia';
import addPeriodSubCommands from './addPeriodSubCommands';
import addTankChoices from './addTankChoices';
import addUsernameChoices from './addUsernameChoices';

export default async function addStatTypeSubCommandGroups(
  option: SlashCommandBuilder,
  addMultiTank = true,
) {
  const awaitedTankopediaInfo = await tankopediaInfo;

  option
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option.addStringOption(addUsernameChoices),
      )
        .setName('player' satisfies StatType)
        .setDescription('Player statistics'),
    )
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameChoices),
      )
        .setName('tank' satisfies StatType)
        .setDescription('Tank statistics'),
    );

  if (addMultiTank)
    option.addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addUsernameChoices)
          .addStringOption((option) => {
            option
              .setName('nation')
              .setDescription('Nation')
              .addChoices(
                ...Object.entries(awaitedTankopediaInfo.vehicle_nations).map(
                  ([type, name]) => ({ name, value: type }),
                ),
              );

            return option;
          })
          .addStringOption((option) =>
            option
              .setName('tank-type')
              .setDescription('Type')
              .addChoices(
                ...Object.entries(awaitedTankopediaInfo.vehicle_types).map(
                  ([type, name]) => ({
                    name: name.replace(' Tank', ''),
                    value: type,
                  }),
                ),
              )
              .setRequired(false),
          )
          .addIntegerOption((option) =>
            option
              .setName('tier')
              .setDescription('Tier')
              .setMinValue(1)
              .setMaxValue(10)
              .setRequired(false),
          )
          .addStringOption((option) =>
            option
              .setName('tree-type')
              .setDescription('Tech tree type')
              .addChoices(
                {
                  name: 'Tech Tree',
                  value: 'techtree' satisfies TreeTypeString,
                },
                { name: 'Premium', value: 'premium' satisfies TreeTypeString },
                {
                  name: 'Collector',
                  value: 'collector' satisfies TreeTypeString,
                },
              )
              .setRequired(false),
          ),
      )
        .setName('multi-tank' satisfies StatType)
        .setDescription('Multiple tanks'),
    );

  return option;
}
