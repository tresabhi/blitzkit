import { ButtonInteraction } from 'discord.js';
import { StatFilters } from '../../_core/statistics/filterStats';
import { TreeTypeString } from '../../components/Tanks';

export function getFiltersFromButton(interaction: ButtonInteraction) {
  const url = new URL(`https://example.com/${interaction.customId}`);

  return {
    nation: url.searchParams.get('nation') ?? undefined,
    tank: parseInt(url.searchParams.get('tank') ?? '0') || undefined,
    tankType: url.searchParams.get('tank-type') ?? undefined,
    treeType:
      (url.searchParams.get('tree-type') as TreeTypeString | undefined) ??
      undefined,
    tier: parseInt(url.searchParams.get('tier') ?? '0') || undefined,
  } satisfies StatFilters;
}
