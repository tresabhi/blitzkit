import AllStatsOverview from '../components/AllStatsOverview';
import NoData, { NoDataType } from '../components/NoData';
import PoweredBy, { PoweredByType } from '../components/PoweredBy';
import { TreeTypeString } from '../components/Tanks';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import calculateWN8 from '../core/blitz/calculateWN8';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankName from '../core/blitz/resolveTankName';
import sumStats from '../core/blitz/sumStats';
import { tankopedia } from '../core/blitz/tankopedia';
import getDiffedTankStats from '../core/blitzstars/getDiffedTankStats';
import { tankAverages } from '../core/blitzstars/tankAverages';
import { ResolvedPeriod } from '../core/discord/resolvePeriodFromCommand';
import { ResolvedPlayer } from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { theme } from '../stitches.config';
import {
  AccountInfo,
  AllStats,
  SupplementaryStats,
} from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';

export type StatType = 'player' | 'tank' | 'multi-tank';

export interface MultiTankFilters {
  nation: string;
  'tank-type': string;
  tier: number;
  'tree-type': TreeTypeString;
}

export default async function stats<Type extends StatType>(
  type: Type,
  { start, end, statsName }: ResolvedPeriod,
  { region: server, id }: ResolvedPlayer,
  filters: Type extends 'tank'
    ? number
    : Type extends 'multi-tank'
    ? Partial<MultiTankFilters>
    : null,
  naked = false,
) {
  let nameDiscriminator: string | undefined;
  let image: string | undefined;

  if (type === 'player' || type === 'multi-tank') {
    const clan = (
      await getWargamingResponse<PlayerClanData>(
        `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
      )
    )[id]?.clan;

    if (clan) nameDiscriminator = `[${clan.tag}]`;
    image = clan
      ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
      : undefined;
  } else if (type === 'tank') {
    nameDiscriminator = `(${await resolveTankName(filters as number)})`;
    image = (await tankopedia)[filters as number]?.images.normal;
  } else {
  }

  const { diffed, order } = await getDiffedTankStats(server, id, start, end);
  const awaitedTankopedia = await tankopedia;
  let stats: AllStats | undefined;
  let supplementaryStats: SupplementaryStats;

  if (type === 'player' || type === 'multi-tank') {
    const typedFilters = filters as Partial<MultiTankFilters> | null;
    const filteredOrder = order.filter(
      (id) =>
        typedFilters === null ||
        ((typedFilters.nation === undefined ||
          awaitedTankopedia[id]?.nation === typedFilters.nation) &&
          (typedFilters['tank-type'] === undefined ||
            awaitedTankopedia[id]?.type === typedFilters['tank-type']) &&
          (typedFilters.tier === undefined ||
            awaitedTankopedia[id]?.tier === typedFilters.tier) &&
          (typedFilters['tree-type'] === undefined ||
            (typedFilters['tree-type'] === 'collector' &&
              awaitedTankopedia[id]?.is_collectible) ||
            (typedFilters['tree-type'] === 'premium' &&
              awaitedTankopedia[id]?.is_premium) ||
            (typedFilters['tree-type'] === 'techtree' &&
              !awaitedTankopedia[id]?.is_collectible &&
              !awaitedTankopedia[id]?.is_premium))),
    );
    const awaitedTankAverages = await tankAverages;
    stats = sumStats(filteredOrder.map((id) => diffed[id]));
    const battlesOfTanksWithAverages = filteredOrder.reduce<number>(
      (accumulator, id) =>
        awaitedTankAverages[id]
          ? accumulator + diffed[id].battles
          : accumulator,
      0,
    );
    const battlesOfTanksWithTankopediaEntry = filteredOrder.reduce<number>(
      (accumulator, id) =>
        awaitedTankopedia[id] ? accumulator + diffed[id].battles : accumulator,
      0,
    );

    supplementaryStats = {
      WN8:
        filteredOrder.reduce<number>(
          (accumulator, id) =>
            awaitedTankAverages[id]
              ? accumulator +
                calculateWN8(awaitedTankAverages[id].all, diffed[id]) *
                  diffed[id].battles
              : accumulator,
          0,
        ) / battlesOfTanksWithAverages,
      tier:
        filteredOrder.reduce<number>(
          (accumulator, id) =>
            awaitedTankopedia[id]
              ? accumulator + awaitedTankopedia[id]!.tier * diffed[id].battles
              : accumulator,
          0,
        ) / battlesOfTanksWithTankopediaEntry,
    };
  } else {
    stats = diffed[(filters as number)!];

    supplementaryStats = {
      WN8: stats
        ? calculateWN8(
            (await tankAverages)[(filters as number)!].all,
            diffed[(filters as number)!],
          )
        : undefined,
      tier: (await tankopedia)[(filters as number)!]?.tier,
    };
  }

  const accountInfo = await getWargamingResponse<AccountInfo>(
    `https://api.wotblitz.${server}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );
  const overview = (
    <AllStatsOverview stats={stats} supplementaryStats={supplementaryStats} />
  );
  const footer = (
    <span
      style={{
        color: theme.colors.textLowContrast,
        fontSize: 16,
        display: 'flex',
        gap: 4,
      }}
    >
      <u>/full-stats</u> for all statistics
    </span>
  );

  return naked ? (
    <Wrapper naked>{overview}</Wrapper>
  ) : (
    <Wrapper>
      <TitleBar
        name={accountInfo[id].nickname}
        image={image}
        nameDiscriminator={nameDiscriminator}
        description={`${statsName} • ${new Date().toDateString()}`}
      />

      {!stats?.battles && <NoData type={NoDataType.BattlesInPeriod} />}
      {stats?.battles > 0 && overview}

      <PoweredBy type={PoweredByType.BlitzStars} footer={footer} />
    </Wrapper>
  );
}
