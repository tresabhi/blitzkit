import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { go } from 'fuzzysort';
import errorEmbed from '../interaction/errorEmbed.js';
import { TANKS, tankopedia } from './tankopedia.js';

export default async function resolveTankId(
  interaction: ChatInputCommandInteraction<CacheType>,
  tank: string,
) {
  const number = Number(tank);

  if (Number.isNaN(number)) {
    const searchResult = go(tank, TANKS, { keys: ['name'], limit: 1 });

    if (searchResult.length === 0) {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            'Tank not found',
            `Could not find tank by the name "${tank}".`,
          ),
        ],
      });

      throw new Error(`Tank not found by name "${tank}"`);
    } else {
      return searchResult[0].obj.tank_id;
    }
  } else {
    if (tankopedia[number]) {
      return number;
    } else {
      await interaction.editReply({
        embeds: [
          errorEmbed(
            'Tank not found',
            `Could not find tank by the ID "${number}".`,
          ),
        ],
      });

      throw new Error(`Tank not found by ID "${number}"`);
    }
  }
}
