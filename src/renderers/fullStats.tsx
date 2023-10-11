import GenericAllStats from '../components/GenericAllStats';
import NoData, { NoDataType } from '../components/NoData';
import TierWeights, { TierWeightsRecord } from '../components/TierWeights';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import calculateWN8 from '../core/blitz/calculateWN8';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import resolveTankName from '../core/blitz/resolveTankName';
import sumStats from '../core/blitz/sumStats';
import { Tier, tankopedia } from '../core/blitz/tankopedia';
import getDiffedTankStats from '../core/blitzstars/getDiffedTankStats';
import { tankAverages } from '../core/blitzstars/tankAverages';
import { ResolvedPeriod } from '../core/discord/resolvePeriodFromCommand';
import { ResolvedPlayer } from '../core/discord/resolvePlayerFromCommand';
import {
  AccountInfo,
  AllStats,
  SupplementaryStats,
} from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';
import { MultiTankFilters, StatType } from './stats';

export default async function fullStats<Type extends StatType>(
  type: Type,
  { start, end, name: statsName }: ResolvedPeriod,
  { region: server, id }: ResolvedPlayer,
  filters: Type extends 'tank'
    ? number
    : Type extends 'multi-tank'
    ? Partial<MultiTankFilters>
    : null,
) {
  let nameDiscriminator: string | undefined;
  let image: string | undefined;

  if (type === 'player' || type === 'multi-tank') {
    const clan = (
      await getWargamingResponse<PlayerClanData>(
        `https://api.wotblitz.${server}/wotb/clans/accountinfo/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
      )
    )[id]?.clan;

    if (clan) nameDiscriminator = `[${clan.tag}]`;
    image = clan
      ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
      : undefined;
  } else if (type === 'tank') {
    nameDiscriminator = `(${await resolveTankName(filters as number)})`;
    image = (await tankopedia)[filters as number]?.images.normal;
  }

  const { diff: diffed, order } = await getDiffedTankStats(
    server,
    id,
    start,
    end,
  );
  const awaitedTankopedia = await tankopedia;
  let stats: AllStats | undefined;
  let supplementaryStats: SupplementaryStats;
  let tierWeights: TierWeightsRecord;

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
    tierWeights = filteredOrder.reduce<TierWeightsRecord>((accumulator, id) => {
      const tankopediaEntry = awaitedTankopedia[id];

      if (!tankopediaEntry) return accumulator;

      const tier = tankopediaEntry.tier as Tier;

      if (accumulator[tier]) {
        accumulator[tier]! += diffed[id].battles;
      } else {
        accumulator[tier] = diffed[id].battles;
      }

      return accumulator;
    }, {});
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
    `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
  );

  return (
    <Wrapper>
      <TitleBar
        name={accountInfo[id].nickname}
        nameDiscriminator={nameDiscriminator}
        image={image}
        description={`${statsName} • ${new Date().toDateString()}`}
      />

      {stats.battles === 0 && <NoData type={NoDataType.BattlesInPeriod} />}
      {stats.battles > 0 && type === 'player' && (
        <TierWeights weights={tierWeights!} />
      )}
      {stats.battles > 0 && (
        <GenericAllStats
          stats={stats}
          supplementaryStats={supplementaryStats}
        />
      )}
    </Wrapper>
  );
}
