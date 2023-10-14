import { ChatInputCommandInteraction } from 'discord.js';
import { TreeTypeString } from '../../components/Tanks';
import resolveTankId from '../../core/blitz/resolveTankId';
import { StatFilters } from '../../core/statistics/filterStats';

export async function getFiltersFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  const tankRaw = interaction.options.getString('tank');

  return {
    nation: interaction.options.getString('nation') ?? undefined,
    tier: parseInt(interaction.options.getString('tier') ?? '0') || undefined,
    tankType: interaction.options.getString('tank-type') ?? undefined,
    treeType:
      (interaction.options.getString('tree-type') as
        | TreeTypeString
        | undefined) ?? undefined,
    tank: tankRaw === null ? undefined : await resolveTankId(tankRaw),
  } satisfies StatFilters;
}
