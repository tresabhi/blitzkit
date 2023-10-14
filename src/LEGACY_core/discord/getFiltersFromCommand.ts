import { ChatInputCommandInteraction } from 'discord.js';
import { TreeTypeString } from '../../components/Tanks';
import { StatFilters } from '../../core/statistics/filterStats';

export function getFiltersFromCommand(
  interaction: ChatInputCommandInteraction,
) {
  return {
    nation: interaction.options.getString('nation') ?? undefined,
    tier: parseInt(interaction.options.getString('tier') ?? '0') || undefined,
    tankType: interaction.options.getString('tank-type') ?? undefined,
    treeType:
      (interaction.options.getString('tree-type') as
        | TreeTypeString
        | undefined) ?? undefined,
    tank: parseInt(interaction.options.getString('tank') ?? '0') || undefined,
  } satisfies StatFilters;
}
