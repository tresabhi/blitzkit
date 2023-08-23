import { SlashCommandStringOption } from 'discord.js';
import { range } from 'lodash';
import numberToRomanNumeral from '../blitz/numberToRomanNumeral';

export default function addTierChoices(option: SlashCommandStringOption) {
  return option
    .setName('tier')
    .setDescription('The tier you want to see')
    .setChoices(
      ...range(10, 0).map((tier) => ({
        name: `Tier ${tier} - ${numberToRomanNumeral(tier)}`,
        value: `${tier}`,
      })),
    )
    .setRequired(true);
}
