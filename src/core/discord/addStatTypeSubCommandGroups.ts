import { SlashCommandBuilder } from 'discord.js';
import { tankopediaInfo } from '../blitz/tankopedia';
import addPeriodSubCommands from './addPeriodSubCommands';
import addTankChoices from './addTankChoices';
import addUsernameChoices from './addUsernameChoices';

export default async function addStatTypeSubCommandGroups(
  option: SlashCommandBuilder,
) {
  const awaitedTankopediaInfo = await tankopediaInfo;

  return option
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option.addStringOption(addUsernameChoices),
      )
        .setName('player')
        .setDescription('Player statistics'),
    )
    .addSubcommandGroup((option) =>
      addPeriodSubCommands(option, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameChoices),
      )
        .setName('tank')
        .setDescription('Tank statistics'),
    )
    .addSubcommandGroup((option) =>
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
                { name: 'Tech Tree', value: 'techtree' },
                { name: 'Premium', value: 'premium' },
                { name: 'Collector', value: 'collector' },
              )
              .setRequired(false),
          ),
      )
        .setName('multi-tank')
        .setDescription('Multiple tanks'),
    );
}
