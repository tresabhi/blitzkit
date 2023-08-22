import * as Breakdown from '../components/Breakdown';
import NoData, { NoDataType } from '../components/NoData';
import PoweredBy, { PoweredByType } from '../components/PoweredBy';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import calculateWN8 from '../core/blitz/calculateWN8';
import getTankStats from '../core/blitz/getTankStats';
import getTreeType from '../core/blitz/getTreeType';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankName from '../core/blitz/resolveTankName';
import sumStats from '../core/blitz/sumStats';
import { tankopedia } from '../core/blitz/tankopedia';
import getDiffedTankStats from '../core/blitzstars/getDiffedTankStats';
import getPeriodNow from '../core/blitzstars/getPeriodNow';
import getTimeDaysAgo from '../core/blitzstars/getTimeDaysAgo';
import { tankAverages } from '../core/blitzstars/tankAverages';
import { ResolvedPlayer } from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { AccountInfo, AllStats } from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';
import { PossiblyPromise } from '../types/possiblyPromise';

export default async function today(
  { region: server, id }: ResolvedPlayer,
  cutoff = Infinity,
  maximized = 4,
  showTotal = true,
  naked?: boolean,
) {
  const { diffed, order } = await getDiffedTankStats(
    server,
    id,
    getTimeDaysAgo(server, 1),
    getPeriodNow(),
  );
  const accountInfo = await getWargamingResponse<AccountInfo>(
    `https://api.wotblitz.${server}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );
  const clanData = await getWargamingResponse<PlayerClanData>(
    `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
  );
  const careerTankStatsRaw = await getTankStats(server, id);
  const careerStats: Record<number, AllStats> = showTotal
    ? {
        0: accountInfo[id].statistics.all,
      }
    : {};
  const allStatsToAccumulate: AllStats[] = [];

  Object.entries(diffed).forEach(([, tankStats]) => {
    allStatsToAccumulate.push(tankStats);
  });
  Object.entries(careerTankStatsRaw).forEach(([, tankStats]) => {
    careerStats[tankStats.tank_id] = tankStats.all;
  });

  const accumulatedStats = sumStats(allStatsToAccumulate);

  if (showTotal && Object.keys(diffed).length > 0) {
    diffed[0] = accumulatedStats;
  }

  const tankStatsOverTimeEntries = Object.entries(diffed);
  const todayWN8s = await tankStatsOverTimeEntries.reduce<
    PossiblyPromise<Record<number, number>>
  >(async (accumulator, [tankIdString, tankStats]) => {
    const tankId = parseInt(tankIdString);

    return (showTotal && tankId === 0) || !(await tankAverages)[tankId]
      ? accumulator
      : {
          ...(await accumulator),
          [tankId]: calculateWN8((await tankAverages)[tankId].all, tankStats),
        };
  }, {});

  const careerWN8s = await careerTankStatsRaw.reduce<
    PossiblyPromise<Record<number, number>>
  >(async (accumulator, { tank_id }) => {
    return (showTotal && tank_id === 0) ||
      (await tankAverages)[tank_id] === undefined
      ? accumulator
      : {
          ...(await accumulator),
          [tank_id]: calculateWN8(
            (await tankAverages)[tank_id].all,
            careerStats[tank_id],
          ),
        };
  }, {});
  const todayWN8sEntries = Object.entries(todayWN8s);
  const careerWN8sEntries = Object.entries(careerWN8s);

  if (showTotal) {
    todayWN8s[0] =
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString, wn8]) =>
          accumulator + wn8 * diffed[Number(tankIdString)].battles,
        0,
      ) /
      todayWN8sEntries.reduce(
        (accumulator, [tankIdString]) =>
          accumulator + diffed[Number(tankIdString)].battles,
        0,
      );
    careerWN8s[0] =
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + WN8 * careerStats[Number(tankIdString)].battles,
        0,
      ) /
      careerWN8sEntries.reduce(
        (accumulator, [tankIdString, WN8]) =>
          isNaN(WN8)
            ? accumulator
            : accumulator + careerStats[Number(tankIdString)].battles,
        0,
      );
  }

  const rows = await Promise.all(
    [
      // this code unreadable on god will forget tomorrow no cap
      ...(order.length === 0 || !showTotal ? [] : [0]),
      ...(isFinite(cutoff) ? order.slice(0, cutoff) : order),
    ].map(async (id, index) => {
      const tankStats = diffed[id];
      const career = careerStats[id];
      const tankopediaEntry = (await tankopedia)[id];

      return (
        <Breakdown.Row
          isTank={!showTotal || id !== 0}
          tankType={tankopediaEntry?.type}
          treeType={tankopediaEntry ? await getTreeType(id) : undefined}
          minimized={showTotal ? index > maximized : index + 1 > maximized}
          key={id}
          name={showTotal && id === 0 ? 'Total' : await resolveTankName(id)}
          winrate={tankStats.wins / tankStats.battles}
          careerWinrate={career.wins / career.battles}
          WN8={isNaN(todayWN8s[id]) ? undefined : todayWN8s[id]}
          careerWN8={isNaN(careerWN8s[id]) ? undefined : careerWN8s[id]}
          damage={tankStats.damage_dealt / tankStats.battles}
          careerDamage={career.damage_dealt / career.battles}
          battles={tankStats.battles}
          careerBattles={career.battles}
        />
      );
    }),
  );

  return naked ? (
    <Wrapper naked>
      <Breakdown.Root>{rows}</Breakdown.Root>
    </Wrapper>
  ) : (
    <Wrapper>
      <TitleBar
        name={accountInfo[id].nickname}
        nameDiscriminator={
          clanData[id]?.clan ? `[${clanData[id]?.clan?.tag}]` : undefined
        }
        image={
          clanData[id]?.clan
            ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clanData[id]?.clan?.emblem_set_id}.png`
            : undefined
        }
        description={`Today's breakdown • ${new Date().toDateString()}`}
      />

      {rows.length === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
      {rows.length > 0 && <Breakdown.Root>{rows}</Breakdown.Root>}

      <PoweredBy type={PoweredByType.BlitzStars} />
    </Wrapper>
  );
}
