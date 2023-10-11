import { SlashCommandBuilder } from 'discord.js';
import GenericAllStats from '../components/GenericAllStats';
import NoData, { NoDataType } from '../components/NoData';
import TierWeights from '../components/TierWeights';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { StatFilters, filterStats } from '../core/blitz/filterStats';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanLogo } from '../core/blitz/getClanLogo';
import { playerClanInfo } from '../core/blitz/playerClanInfo';
import { filtersToDescription } from '../core/blitzkrieg/filtersToDescription';
import { getTierWeights } from '../core/blitzkrieg/getTierWeights';
import { getBlitzStarsLinkButton } from '../core/blitzstars/getBlitzStarsLinkButton';
import getDiffedTankStats from '../core/blitzstars/getDiffedTankStats';
import addStatTypeSubCommandGroups from '../core/discord/addStatTypeSubCommandGroups';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import { getCustomPeriodParams } from '../core/discord/getCustomPeriodParams';
import { getFiltersFromButton } from '../core/discord/getFiltersFromButton';
import { getFiltersFromCommand } from '../core/discord/getFiltersFromCommand';
import interactionToURL from '../core/discord/interactionToURL';
import { refreshButton } from '../core/discord/refreshButton';
import resolvePeriodFromButton from '../core/discord/resolvePeriodFromButton';
import resolvePeriodFromCommand, {
  ResolvedPeriod,
} from '../core/discord/resolvePeriodFromCommand';
import resolvePlayerFromButton from '../core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand, {
  ResolvedPlayer,
} from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistryRaw } from '../events/interactionCreate';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  filters: StatFilters,
) {
  const nickname = (await getAccountInfo(region, id))[id].nickname;
  const clan = (await playerClanInfo(region, id))[id]?.clan;
  const clanImage = clan ? getClanLogo(clan.emblem_set_id) : undefined;
  const diffedTankStats = await getDiffedTankStats(region, id, start, end);
  const { stats, supplementary, filteredOrder } = await filterStats(
    diffedTankStats,
    filters,
  );
  const filterDescriptions = await filtersToDescription(filters);
  const tierWeights = await getTierWeights(diffedTankStats.diff, filteredOrder);

  return (
    <Wrapper>
      <TitleBar
        name={nickname}
        image={clanImage}
        description={`${name} • ${filterDescriptions}`}
      />

      {stats.battles === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
      {stats.battles > 0 && <TierWeights weights={tierWeights!} />}
      {stats.battles > 0 && (
        <GenericAllStats stats={stats} supplementaryStats={supplementary} />
      )}
    </Wrapper>
  );
}

export const fullStatsCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const command = await addStatTypeSubCommandGroups(
      new SlashCommandBuilder()
        .setName('full-stats')
        .setDescription('Full in-game statistics'),
      (option) => option.addStringOption(addUsernameChoices),
    );

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const resolvedPlayer = await resolvePlayerFromCommand(interaction);
        const resolvedPeriod = resolvePeriodFromCommand(
          resolvedPlayer.region,
          interaction,
        );
        const filters = getFiltersFromCommand(interaction);
        const path = interactionToURL(interaction, {
          ...resolvedPlayer,
          ...getCustomPeriodParams(interaction),
          ...filters,
        });

        return Promise.all([
          render(resolvedPlayer, resolvedPeriod, filters),
          refreshButton(interaction, path),
          getBlitzStarsLinkButton(resolvedPlayer.region, resolvedPlayer.id),
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
  },
);
