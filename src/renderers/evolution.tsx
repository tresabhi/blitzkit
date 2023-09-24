import * as Graph from '../components/Graph';
import NoData, { NoDataType } from '../components/NoData';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankName from '../core/blitz/resolveTankName';
import { tankopedia } from '../core/blitz/tankopedia';
import getPlayerHistories from '../core/blitzstars/getPlayerHistories';
import getTankHistories from '../core/blitzstars/getTankHistories';
import { ResolvedPeriod } from '../core/discord/resolvePeriodFromCommand';
import { ResolvedPlayer } from '../core/discord/resolvePlayerFromCommand';
import { AccountInfo } from '../types/accountInfo';
import { Histories } from '../types/histories';
import { PlayerClanData } from '../types/playerClanData';
import { StatType } from './stats';

export default async function evolution<Type extends StatType>(
  type: Type,
  { start, end, evolutionName }: ResolvedPeriod,
  { region: server, id }: ResolvedPlayer,
  tankId: Type extends 'tank' ? number : null,
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
    nameDiscriminator = `(${await resolveTankName(tankId!)})`;
    image = (await tankopedia)[tankId!]?.images.normal;
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
    `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  return (
    <Wrapper>
      <TitleBar
        name={accountInfo[id].nickname}
        nameDiscriminator={nameDiscriminator}
        image={image}
        description={`${evolutionName} • ${new Date().toDateString()}`}
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
