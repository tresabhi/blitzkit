import {
  TANK_CLASSES,
  TIER_ROMAN_NUMERALS,
  TankDefinition,
  Tier,
  flags,
  tankDefinitions,
} from '@blitzkit/core';
import { gameDefinitions } from '@blitzkit/core/src/blitzkit/gameDefinitions';
import { chunk } from 'lodash';
import markdownEscape from 'markdown-escape';
import { getAccountInfo } from '../../../website/src/core/blitz/getAccountInfo';
import getTankStats from '../../../website/src/core/blitz/getTankStats';
import addTierChoices from '../core/discord/addTierChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

const TANKS_PER_MESSAGE = 64;

export const ownedTanksCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: createLocalizedCommand('owned-tanks')
      .addStringOption(addTierChoices)
      .addStringOption(addUsernameChoices),

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      const tier = Number(interaction.options.getString('tier'));
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const accountInfo = await getAccountInfo(region, id);
      const tankStats = await getTankStats(region, id);

      if (tankStats === null) {
        return t`bot.common.errors.no_tank_stats`;
      }

      const filteredTanks = (
        await Promise.all(
          tankStats.map(async (tankData) => ({
            tankDefinitions: (await tankDefinitions)[tankData.tank_id]!,
            id: tankData.tank_id,
          })),
        )
      ).filter((tank) => tank.tankDefinitions?.tier === tier);
      const groupedTanks: Record<string, TankDefinition[]> = {};
      const nations: string[] = [];

      filteredTanks.forEach((tank) => {
        if (groupedTanks[tank.tankDefinitions.nation] === undefined) {
          groupedTanks[tank.tankDefinitions.nation] = [tank.tankDefinitions];
          nations.push(tank.tankDefinitions.nation);
        } else {
          groupedTanks[tank.tankDefinitions.nation].push(tank.tankDefinitions);
        }
      });

      const awaitedTankDefinitions = await tankDefinitions;
      const awaitedGameDefinitions = await gameDefinitions;
      const lines = tankStats
        .map(({ tank_id }) => awaitedTankDefinitions[tank_id])
        .filter((tank) => tank.tier === tier)
        .sort(
          (a, b) =>
            TANK_CLASSES.indexOf(a.class) - TANK_CLASSES.indexOf(b.class),
        )
        .sort(
          (a, b) =>
            awaitedGameDefinitions.nations.indexOf(a.nation) -
            awaitedGameDefinitions.nations.indexOf(b.nation),
        )
        .map((tank) => `${flags[tank.nation]} ${markdownEscape(tank.name)}`);

      return chunk(lines, TANKS_PER_MESSAGE).map((lines, index) =>
        index === 0
          ? `${translate('bot.commands.owned_tanks.body.title', [
              markdownEscape(accountInfo.nickname),
              TIER_ROMAN_NUMERALS[tier as Tier],
            ])}${lines.join('\n')}`
          : lines.join('\n'),
      );
    },

    autocomplete: autocompleteUsername,
  });
});
