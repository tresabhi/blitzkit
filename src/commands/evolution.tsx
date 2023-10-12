import { SlashCommandBuilder } from 'discord.js';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankId from '../core/blitz/resolveTankId';
import getPlayerHistories from '../core/blitzstars/getPlayerHistories';
import getTankHistories from '../core/blitzstars/getTankHistories';
import addStatTypeSubCommandGroups from '../core/discord/addStatTypeSubCommandGroups';
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
import { PlayerClanInfo } from '../types/playerClanData';

async function render(
  { region, id }: ResolvedPlayer,
  { start, end, name }: ResolvedPeriod,
  type: 'player' | 'tank',
  tankId?: number,
) {
  let nameDiscriminator: string | undefined;
  let image: string | undefined;

  if (type === 'player') {
    const clan = (
      await getWargamingResponse<PlayerClanInfo>(
        `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
      )
    )[id]?.clan;

    if (clan) nameDiscriminator = `[${clan.tag}]`;
    image = clan
      ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
      : undefined;
  } else {
    nameDiscriminator = `(${await resolveTankName(tankId!)})`;
    image = (await tankopedia)[tankId!]?.images.normal;
  }

  let histories: Histories;

  if (type === 'player') {
    histories = await getPlayerHistories(region, id, {
      start,
      end,
      includeLatestHistories: true,
      includePreviousHistories: true,
    });
  } else {
    histories = await getTankHistories(region, id, {
      tankId: tankId!,
      start,
      end,
      includeLatestHistories: true,
      includePreviousHistories: true,
    });
  }

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
        image={image}
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
    const command = await addStatTypeSubCommandGroups(
      new SlashCommandBuilder()
        .setName('evolution')
        .setDescription('Evolution of statistics'),
      // (option) =>
      //   option
      //     .addStringOption((option) =>
      //       addStatPropertyOptions(option)
      //         .setName('x')
      //         .setDescription('X axis')
      //         .setRequired(false),
      //     )
      //     .addStringOption((option) =>
      //       addStatPropertyOptions(option)
      //         .setName('y')
      //         .setDescription('Y axis')
      //         .setRequired(false),
      //     )
      //     .addStringOption(addUsernameChoices),
    );

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const commandGroup = interaction.options.getSubcommandGroup(
          true,
        ) as StatType;
        const player = await resolvePlayerFromCommand(interaction);
        const period = resolvePeriodFromCommand(player.region, interaction);
        const tankIdRaw = interaction.options.getString('tank')!;
        const tankId =
          commandGroup === 'tank' ? await resolveTankId(tankIdRaw) : null;
        const start = interaction.options.getInteger('start');
        const end = interaction.options.getInteger('end');
        const { nickname } = (
          await getWargamingResponse<AccountInfo>(
            `https://api.wotblitz.${player.region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
          )
        )[player.id];
        const path = interactionToURL(interaction, {
          ...player,
          tankId,
          start,
          end,
        });

        return [
          await render(commandGroup, period, player, tankId),
          primaryButton(path, 'Refresh'),
          linkButton(
            `https://www.blitzstars.com/player/${player.region}/${nickname}${
              commandGroup === 'tank' ? `/tank/${tankId!}` : ''
            }`,
            'BlitzStars',
          ),
        ];
      },

      autocomplete: (interaction) => {
        autocompleteUsername(interaction);
        autocompleteTanks(interaction);
        // autocompleteStatProperty(interaction, 'x');
      },

      async button(interaction) {
        const url = new URL(`https://example.com/${interaction.customId}`);
        const path = url.pathname.split('/').filter(Boolean);
        const commandGroup = path[1] as StatType;
        const player = await resolvePlayerFromButton(interaction);
        const period = resolvePeriodFromButton(player.region, interaction);

        return await render(
          commandGroup,
          period,
          player,
          parseInt(url.searchParams.get('tankId')!),
        );
      },
    });
  },
);
