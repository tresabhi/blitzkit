import { SlashCommandBuilder } from 'discord.js';
import { filtersToDescription } from '../LEGACY_core/blitzkrieg/filtersToDescription';
import { getBlitzStarsLinkButton } from '../LEGACY_core/blitzstars/getBlitzStarsLinkButton';
import getDiffedTankStats from '../LEGACY_core/blitzstars/getDiffedTankStats';
import addStatTypeSubCommands from '../LEGACY_core/discord/addStatTypeSubCommands';
import addUsernameChoices from '../LEGACY_core/discord/addUsernameChoices';
import autocompleteTanks from '../LEGACY_core/discord/autocompleteTanks';
import autocompleteUsername from '../LEGACY_core/discord/autocompleteUsername';
import { getCustomPeriodParams } from '../LEGACY_core/discord/getCustomPeriodParams';
import { getFiltersFromButton } from '../LEGACY_core/discord/getFiltersFromButton';
import { getFiltersFromCommand } from '../LEGACY_core/discord/getFiltersFromCommand';
import interactionToURL from '../LEGACY_core/discord/interactionToURL';
import { refreshButton } from '../LEGACY_core/discord/refreshButton';
import resolvePeriodFromButton from '../LEGACY_core/discord/resolvePeriodFromButton';
import resolvePeriodFromCommand, {
  ResolvedPeriod,
} from '../LEGACY_core/discord/resolvePeriodFromCommand';
import resolvePlayerFromButton from '../LEGACY_core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand, {
  ResolvedPlayer,
} from '../LEGACY_core/discord/resolvePlayerFromCommand';
import AllStatsOverview from '../components/AllStatsOverview';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import { StatFilters, filterStats } from '../core/statistics/filterStats';
import { CommandRegistryRaw } from '../events/interactionCreate';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  filters: StatFilters,
) {
  const { nickname } = await getAccountInfo(region, id);
  const clan = (await getClanAccountInfo(region, id))?.clan;
  const clanImage = clan ? emblemIdToURL(clan.emblem_set_id) : undefined;
  const diffedTankStats = await getDiffedTankStats(region, id, start, end);
  const { stats, supplementary } = await filterStats(diffedTankStats, filters);
  const filterDescriptions = await filtersToDescription(filters);

  return (
    <Wrapper>
      <TitleBar
        name={nickname}
        image={clanImage}
        description={`${name} • ${filterDescriptions}`}
      />

      {!stats.battles && <NoData type={NoDataType.BattlesInPeriod} />}
      {stats.battles > 0 && (
        <AllStatsOverview stats={stats} supplementaryStats={supplementary} />
      )}
    </Wrapper>
  );
}

export const statsCommand = new Promise<CommandRegistryRaw>(async (resolve) => {
  const command = await addStatTypeSubCommands(
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('Regular battles statistics'),
    (option) => option.addStringOption(addUsernameChoices),
  );

  resolve({
    inProduction: true,
    inPublic: true,

    command,

    async handler(interaction) {
      const player = await resolvePlayerFromCommand(interaction);
      const period = resolvePeriodFromCommand(player.region, interaction);
      const filters = getFiltersFromCommand(interaction);
      const path = interactionToURL(interaction, {
        ...player,
        ...getCustomPeriodParams(interaction),
        ...filters,
      });

      return Promise.all([
        render(player, period, filters),
        refreshButton(interaction, path),
        getBlitzStarsLinkButton(player.region, player.id),
      ]);
    },

    autocomplete: (interaction) => {
      autocompleteUsername(interaction);
      autocompleteTanks(interaction);
    },

    async button(interaction) {
      const player = await resolvePlayerFromButton(interaction);
      const period = resolvePeriodFromButton(player.region, interaction);
      const filters = getFiltersFromButton(interaction);

      return await render(player, period, filters);
    },
  });
});
