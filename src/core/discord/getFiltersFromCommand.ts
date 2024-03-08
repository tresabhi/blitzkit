import { ChatInputCommandInteraction } from 'discord.js';
import { TreeType } from '../../components/Tanks';
import resolveTankId from '../blitz/resolveTankId';
import { StatFilters } from '../statistics/filterStats';

export async function getFiltersFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const tankRaw = interaction.options.getString('tank');

  return {
    nation: interaction.options.getString('nation') ?? undefined,
    tier: parseInt(interaction.options.getString('tier') ?? '0') || undefined,
    tankType: interaction.options.getString('tank-class') ?? undefined,
    treeType:
      (interaction.options.getString('tree-type') as TreeType | undefined) ??
      undefined,
    tank: tankRaw === null ? undefined : await resolveTankId(tankRaw),
  } satisfies StatFilters;
}
