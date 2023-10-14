import {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import addPeriodSubCommands from '../LEGACY_core/discord/addPeriodSubCommands';
import addTankChoices from '../LEGACY_core/discord/addTankChoices';
import addUsernameChoices from '../LEGACY_core/discord/addUsernameChoices';
import autocompleteTanks from '../LEGACY_core/discord/autocompleteTanks';
import autocompleteUsername from '../LEGACY_core/discord/autocompleteUsername';
import { getCustomPeriodParams } from '../LEGACY_core/discord/getCustomPeriodParams';
import interactionToURL from '../LEGACY_core/discord/interactionToURL';
import primaryButton from '../LEGACY_core/discord/primaryButton';
import resolvePeriodFromButton from '../LEGACY_core/discord/resolvePeriodFromButton';
import resolvePeriodFromCommand, {
  ResolvedPeriod,
} from '../LEGACY_core/discord/resolvePeriodFromCommand';
import resolvePlayerFromButton from '../LEGACY_core/discord/resolvePlayerFromButton';
import resolvePlayerFromCommand, {
  ResolvedPlayer,
} from '../LEGACY_core/discord/resolvePlayerFromCommand';
import * as Graph from '../components/Graph';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import resolveTankId from '../core/blitz/resolveTankId';
import { emblemIdToURL } from '../core/blitzkrieg/emblemIdToURL';
import getTankHistories from '../core/blitzkrieg/getTankHistories';
import { getBlitzStarsLinkButton } from '../core/blitzstars/getBlitzStarsLinkButton';
import getPlayerHistories from '../core/blitzstars/getPlayerHistories';
import { CommandRegistryRaw } from '../events/interactionCreate';

type EvolutionStatType = 'player' | 'tank';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  type: 'player' | 'tank',
  tankId: number | null,
) {
  const accountInfo = await getAccountInfo(region, id);
  const clan = (await getClanAccountInfo(region, id))?.clan;
  const logo = clan ? emblemIdToURL(clan.emblem_set_id) : undefined;
  const histories = await (type === 'player'
    ? getPlayerHistories(region, id, {
        start,
        end,
        includeLatestHistories: true,
        includePreviousHistories: true,
      })
    : getTankHistories(region, id, {
        tankId: tankId!,
        start,
        end,
        includeLatestHistories: true,
        includePreviousHistories: true,
      }));
  const plot = histories.map(
    (history) =>
      [
        history.all.battles,
        (history.all.wins / history.all.battles) * 100,
      ] as Graph.PlotItem,
  );
  const times = histories.map((history) => history.last_battle_time);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const ys = plot.map(([, y]) => y);
  const xs = plot.map(([x]) => x);
  const maxY = Math.max(...ys);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const minX = Math.min(...xs);

  return (
    <Wrapper>
      <TitleBar name={accountInfo.nickname} image={logo} description={name} />

      {plot.length > 0 && (
        <Graph.Root
          verticalMargin={{
            min: minY,
            max: maxY,
            suffix: '%',
            precision: 2,
          }}
          horizontalMargin={{
            min: minX,
            max: maxX,
            precision: 0,
          }}
          xMinLabel={new Date(minTime * 1000).toDateString()}
          xMaxLabel={new Date(maxTime * 1000).toDateString()}
        >
          {Graph.Line({
            color: Graph.LineColor.Red,
            plot: plot,
            minY,
            maxY,
          })}
        </Graph.Root>
      )}

      {plot.length === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
    </Wrapper>
  );
}

export const evolutionCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    let playerGroup: SlashCommandSubcommandGroupBuilder;
    let tankGroup: SlashCommandSubcommandGroupBuilder;
    const command = new SlashCommandBuilder()
      .setName('evolution')
      .setDescription('Evolution of statistics')
      .addSubcommandGroup((option) => {
        playerGroup = option
          .setName('player')
          .setDescription('Player statistics');

        return playerGroup;
      })
      .addSubcommandGroup((option) => {
        tankGroup = option.setName('tank').setDescription('Tank statistics');

        return tankGroup;
      });

    await Promise.all([
      addPeriodSubCommands(playerGroup!, (option) =>
        option.addStringOption(addUsernameChoices),
      ),
      addPeriodSubCommands(tankGroup!, (option) =>
        option
          .addStringOption(addTankChoices)
          .addStringOption(addUsernameChoices),
      ),
    ]);

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const commandGroup =
          interaction.options.getSubcommandGroup() as EvolutionStatType;
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const tankIdRaw = interaction.options.getString('tank')!;
        const tankId =
          commandGroup === 'tank' ? await resolveTankId(tankIdRaw) : null;
        const path = interactionToURL(interaction, {
          ...player,
          ...getCustomPeriodParams(interaction),
          tankId,
        });

        getBlitzStarsLinkButton;

        return [
          await render(player, period, commandGroup, tankId),
          primaryButton(path, 'Refresh'),
          await getBlitzStarsLinkButton(
            player.region,
            player.id,
            tankId ?? undefined,
          ),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
      },

      async button(interaction) {
        const url = new URL(`https://example.com/${interaction.customId}`);
        const path = url.pathname.split('/');
        const commandGroup = path[2] as EvolutionStatType;
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);

        return await render(
          player,
          period,
          commandGroup,
          parseInt(url.searchParams.get('tankId') ?? '0') || null,
        );
      },
    });
  },
);
