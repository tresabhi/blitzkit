import { ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import * as Graph from '../components/Graph/index.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import tanksAutocomplete from '../core/autocomplete/tanks.js';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankId from '../core/blitz/resolveTankId.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getTankHistories from '../core/blitzstars/getTankHistories.js';
import { supportBlitzStars } from '../core/interaction/supportBlitzStars.js';
import {
  Period,
  RELATIVE_PERIOD_NAMES,
} from '../core/options/addPeriodSubCommands.js';
import addStatsSubCommandGroups from '../core/options/addStatsSubCommandGroups.js';
import getPeriodDataFromSubcommand from '../core/options/getPeriodDataFromSubcommand.js';
import { WARGAMING_APPLICATION_ID } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: addStatsSubCommandGroups(
    new SlashCommandBuilder()
      .setName('evolution')
      .setDescription('Evolution of statistics'),
  ),

  async execute(interaction) {
    const commandGroup = interaction.options.getSubcommandGroup()!;
    const { id, server } = await getBlitzAccount(interaction);
    let nameDiscriminator: string | undefined;
    let image: string | undefined;
    const tankIdRaw = interaction.options.getString('tank')!;
    let tankId: number;

    if (commandGroup === 'player') {
      const clan = (
        await getWargamingResponse<PlayerClanData>(
          `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
        )
      )[id]?.clan;

      if (clan) nameDiscriminator = `[${clan.tag}]`;
      image = clan
        ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
        : undefined;
    } else if (commandGroup === 'tank') {
      tankId = resolveTankId(tankIdRaw);
      nameDiscriminator = `(${resolveTankName(tankId)})`;
      image = tankopedia[tankId].images.normal;
    }

    const { evolutionName, start, end } =
      getPeriodDataFromSubcommand(interaction);

    let careerWinrate: Graph.Plot;
    let careerBattles: Graph.Plot;

    if (commandGroup === 'player') {
    } else {
      const tankId = resolveTankId(tankIdRaw);
      const histories = await getTankHistories(server, id, {
        tankId,
        start,
        end,
        includeLatestHistories: true,
        includePreviousHistories: true,
      });

      careerWinrate = histories.map(
        (history) =>
          [
            history.last_battle_time,
            (history.all.wins / history.all.battles) * 100,
          ] as Graph.PlotItem,
      );
      careerBattles = histories.map(
        (history) =>
          [history.last_battle_time, history.all.battles] as Graph.PlotItem,
      );
    }

    const winrateYs = careerWinrate.map(([, y]) => y);
    const maxWinrate = Math.max(...winrateYs);
    const minWinrate = Math.min(...winrateYs);
    const battleYs = careerBattles.map(([, y]) => y);
    const maxBattle = Math.max(...battleYs);
    const minBattle = Math.min(...battleYs);

    const accountInfo = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );

    return [
      <Wrapper>
        <TitleBar
          name={accountInfo[id].nickname}
          nameDiscriminator={nameDiscriminator}
          image={image}
          description={`${evolutionName} • ${new Date().toDateString()} • ${
            BLITZ_SERVERS[server]
          }`}
        />

        {/* goofy ahh bug forces me to call them as functions */}
        {careerWinrate.length > 0 && (
          <Graph.Root
            xMinLabel={
              RELATIVE_PERIOD_NAMES[
                interaction.options.getSubcommand() as Period
              ]
            }
            xMaxLabel="Today"
            leftVerticalMargin={{
              min: minWinrate,
              max: maxWinrate,
              suffix: '%',
            }}
            rightVerticalMargin={{
              min: minBattle,
              max: maxBattle,
            }}
          >
            {Graph.Line({
              // total battles
              plot: careerBattles!,
              color: Graph.LineColor.Blue,
            })}
            {Graph.Line({
              // career winrate
              plot: careerWinrate!,
              minY: minWinrate,
              maxY: maxWinrate,
            })}
          </Graph.Root>
        )}

        {careerWinrate.length === 0 && (
          <NoData type={NoDataType.BattlesInPeriod} />
        )}

        <PoweredByBlitzStars />
      </Wrapper>,
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('View on BlitzStars')
        .setURL(
          commandGroup === 'tank'
            ? `https://www.blitzstars.com/player/com/${
                accountInfo[id].nickname
              }/tank/${tankId!}`
            : `https://www.blitzstars.com/player/com/${accountInfo[id].nickname}`,
        ),
      supportBlitzStars,
    ];
  },

  autocomplete: (interaction) => {
    usernameAutocomplete(interaction);
    tanksAutocomplete(interaction);
  },
} satisfies CommandRegistry;
