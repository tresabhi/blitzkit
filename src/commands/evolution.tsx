import {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import * as Graph from '../components/Graph';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanLogo } from '../core/blitz/getClanLogo';
import { getPlayerClanInfo } from '../core/blitz/getPlayerClanInfo';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankId from '../core/blitz/resolveTankId';
import getPlayerHistories from '../core/blitzstars/getPlayerHistories';
import getTankHistories from '../core/blitzstars/getTankHistories';
import addPeriodSubCommands from '../core/discord/addPeriodSubCommands';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteTanks from '../core/discord/autocompleteTanks';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import interactionToURL from '../core/discord/interactionToURL';
import linkButton from '../core/discord/linkButton';
import primaryButton from '../core/discord/primaryButton';
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

type EvolutionStatType = 'player' | 'tank';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  type: 'player' | 'tank',
  tankId: number | null,
) {
  const clan = (await getPlayerClanInfo(region, id))[id]?.clan;
  const logo = clan ? getClanLogo(clan.emblem_set_id) : undefined;
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

  const accountInfo = await getWargamingResponse<AccountInfo>(
    `https://api.wotblitz.${region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  return (
    <Wrapper>
      <TitleBar
        name={accountInfo[id].nickname}
        image={logo}
        description={name}
      />

      {/* goofy ahh bug forces me to call them as functions */}
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
            // career winrate
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
        option.addStringOption(addUsernameChoices),
      ),
    ]);

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const commandGroup =
          interaction.options.getSubcommandGroup() as EvolutionStatType;
        const resolvedPlayer = await resolvePlayerFromCommand(interaction);
        const resolvedPeriod = resolvePeriodFromCommand(
          resolvedPlayer.region,
          interaction,
        );
        const tankIdRaw = interaction.options.getString('tank')!;
        const tankId =
          commandGroup === 'tank' ? await resolveTankId(tankIdRaw) : null;
        const start = interaction.options.getInteger('start');
        const end = interaction.options.getInteger('end');
        const { nickname } = (
          await getAccountInfo(resolvedPlayer.region, resolvedPlayer.id)
        )[resolvedPlayer.id];
        const path = interactionToURL(interaction, {
          ...resolvedPlayer,
          tankId,
          start,
          end,
        });

        return [
          await render(resolvedPlayer, resolvedPeriod, commandGroup, tankId),
          primaryButton(path, 'Refresh'),
          linkButton(
            `https://www.blitzstars.com/player/${
              resolvedPlayer.region
            }/${nickname}${commandGroup === 'tank' ? `/tank/${tankId!}` : ''}`,
            'BlitzStars',
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
        const commandGroup = path[1] as EvolutionStatType;
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
