import * as Graph from '../components/Graph/index.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredByBlitzStars from '../components/PoweredByBlitzStars.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import { tankopedia } from '../core/blitz/tankopedia.js';
import getPlayerHistories from '../core/blitzstars/getPlayerHistories.js';
import getTankHistories from '../core/blitzstars/getTankHistories.js';
import { ResolvedPeriod } from '../core/discord/resolvePeriodFromCommand.js';
import { ResolvedPlayer } from '../core/discord/resolvePlayer.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/args.js';
import { AccountInfo } from '../types/accountInfo.js';
import { Histories } from '../types/histories.js';
import { PlayerClanData } from '../types/playerClanData.js';
import { StatType } from './stats.js';

export default async function evolution<Type extends StatType>(
  type: Type,
  { start, end, evolutionName }: ResolvedPeriod,
  { server, id }: ResolvedPlayer,
  tankId: Type extends 'tank' ? number : never,
) {
  let nameDiscriminator: string | undefined;
  let image: string | undefined;

  if (type === 'player') {
    const clan = (
      await getWargamingResponse<PlayerClanData>(
        `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
      )
    )[id]?.clan;

    if (clan) nameDiscriminator = `[${clan.tag}]`;
    image = clan
      ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
      : undefined;
  } else {
    nameDiscriminator = `(${resolveTankName(tankId)})`;
    image = tankopedia[tankId].images.normal;
  }

  let histories: Histories;

  if (type === 'player') {
    histories = await getPlayerHistories(server, id, {
      start,
      end,
      includeLatestHistories: true,
      includePreviousHistories: true,
    });
  } else {
    histories = await getTankHistories(server, id, {
      tankId,
      start,
      end,
      includeLatestHistories: true,
      includePreviousHistories: true,
    });
  }

  const careerWinrate = histories.map(
    (history) =>
      [
        history.last_battle_time,
        (history.all.wins / history.all.battles) * 100,
      ] as Graph.PlotItem,
  );
  const careerBattles = histories.map(
    (history) =>
      [history.last_battle_time, history.all.battles] as Graph.PlotItem,
  );
  const winrateYs = careerWinrate.map(([, y]) => y);
  const maxWinrate = Math.max(...winrateYs);
  const minWinrate = Math.min(...winrateYs);
  const battleYs = careerBattles.map(([, y]) => y);
  const maxBattle = Math.max(...battleYs);
  const minBattle = Math.min(...battleYs);
  const minTime = Math.min(...careerBattles.map(([x]) => x));

  const accountInfo = await getWargamingResponse<AccountInfo>(
    `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  return (
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
          xMinLabel={new Date(minTime * 1000).toDateString()}
          xMaxLabel={new Date(end * 1000).toDateString()}
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
    </Wrapper>
  );
}
