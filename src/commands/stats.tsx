import { SlashCommandBuilder } from 'discord.js';
import AllStatsOverview from '../components/AllStatsOverview';
import NoData, { NoDataType } from '../components/NoData';
import { TreeTypeString } from '../components/Tanks';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import { StatFilters, filterStats } from '../core/blitz/filterStats';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import { filtersToDescription } from '../core/blitzkrieg/filtersToDescription';
import { getBlitzStarsLinkButton } from '../core/blitzstars/getBlitzStarsLinkButton';
import getDiffedTankStats from '../core/blitzstars/getDiffedTankStats';
import { PeriodType } from '../core/discord/addPeriodSubCommands';
import addStatTypeSubCommandGroups from '../core/discord/addStatTypeSubCommandGroups';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import autocompleteUsername from '../core/discord/autocompleteUsername';
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
import { AccountInfo } from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';

export default async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name: statsName }: ResolvedPeriod,
  filters: StatFilters,
) {
  const nickname = (
    await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    )
  )[id].nickname;
  const clan = (
    await getWargamingResponse<PlayerClanData>(
      `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
    )
  )[id]?.clan;
  const clanImage = clan
    ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
    : undefined;
  const diffedTankStats = await getDiffedTankStats(region, id, start, end);
  const { stats, supplementary } = await filterStats(diffedTankStats, filters);

  return (
    <Wrapper>
      <TitleBar
        name={nickname}
        image={clanImage}
        description={`${statsName} • ${await filtersToDescription(filters)}`}
      />

      {!stats?.battles && <NoData type={NoDataType.BattlesInPeriod} />}
      {stats?.battles > 0 && (
        <AllStatsOverview stats={stats} supplementaryStats={supplementary} />
      )}
    </Wrapper>
  );
}

export const statsCommand = new Promise<CommandRegistryRaw>(async (resolve) => {
  const command = await addStatTypeSubCommandGroups(
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
      const resolvedPlayer = await resolvePlayerFromCommand(interaction);
      const resolvedPeriod = resolvePeriodFromCommand(
        resolvedPlayer.region,
        interaction,
      );
      const filters = {
        nation: interaction.options.getString('nation') ?? undefined,
        tier:
          parseInt(interaction.options.getString('tier') ?? '0') || undefined,
        tankType: interaction.options.getString('tank-type') ?? undefined,
        treeType:
          (interaction.options.getString('tree-type') as
            | TreeTypeString
            | undefined) ?? undefined,
        tank:
          parseInt(interaction.options.getString('tank') ?? '0') || undefined,
      } satisfies StatFilters;
      const path = interactionToURL(interaction, {
        ...resolvedPlayer,
        ...((interaction.options.getSubcommand() as PeriodType) === 'custom'
          ? {
              start: interaction.options.getInteger('start', true),
              end: interaction.options.getInteger('end', true),
            }
          : undefined),
        ...filters,
      });

      return [
        await render(resolvedPlayer, resolvedPeriod, filters),
        refreshButton(interaction, path),
        await getBlitzStarsLinkButton(resolvedPlayer.region, resolvedPlayer.id),
      ];
    },

    autocomplete: (interaction) => {
      autocompleteUsername(interaction);
      autocompleteTanks(interaction);
    },

    async button(interaction) {
      const url = new URL(`https://example.com${interaction.customId}`);
      const player = await resolvePlayerFromButton(interaction);
      const period = resolvePeriodFromButton(player.region, interaction);

      return await render(player, period, {
        nation: url.searchParams.get('nation') ?? undefined,
        tank: parseInt(url.searchParams.get('tank') ?? '0') || undefined,
        tankType: url.searchParams.get('tank-type') ?? undefined,
        treeType:
          (url.searchParams.get('tree-type') as TreeTypeString | undefined) ??
          undefined,
        tier: parseInt(url.searchParams.get('tier') ?? '0') || undefined,
      });
    },
  });
});
