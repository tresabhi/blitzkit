import { TankClass, TankType } from '@blitzkit/core';
import { ChatInputCommandInteraction } from 'discord.js';
import { resolveTankId } from '../blitz/resolveTankId';
import { StatFilters } from '../blitzstars/filterStats';

export async function getFiltersFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const tankRaw = interaction.options.getString('tank');

  return {
    nation: interaction.options.getString('nation') ?? undefined,
    tier: Number(interaction.options.getString('tier')),
    class:
      (Number(interaction.options.getString('class')) as
        | TankClass
        | undefined) ?? undefined,
    type:
      (Number(interaction.options.getString('type')) as TankType | undefined) ??
      undefined,
    tank:
      tankRaw === null
        ? undefined
        : await resolveTankId(tankRaw, interaction.locale),
  } satisfies StatFilters;
}
