import GenericAllStats from '../components/GenericAllStats.js';
import NoData, { NoDataType } from '../components/NoData.js';
import PoweredBy, { PoweredByType } from '../components/PoweredBy.js';
import TierWeights, { TierWeightsRecord } from '../components/TierWeights.js';
import TitleBar from '../components/TitleBar.js';
import Wrapper from '../components/Wrapper.js';
import { BLITZ_SERVERS } from '../constants/servers.js';
import calculateWN8 from '../core/blitz/calculateWN8.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import resolveTankName from '../core/blitz/resolveTankName.js';
import sumStats from '../core/blitz/sumStats.js';
import { Tier, tankopedia } from '../core/blitz/tankopedia.js';
import getTankStatsDiffed from '../core/blitzstars/getTankStatsDiffed.js';
import { tankAverages } from '../core/blitzstars/tankAverages.js';
import { ResolvedPeriod } from '../core/discord/resolvePeriodFromCommand.js';
import { ResolvedPlayer } from '../core/discord/resolvePlayerFromCommand.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments.js';
import {
  AccountInfo,
  AllStats,
  SupplementaryStats,
} from '../types/accountInfo.js';
import { PlayerClanData } from '../types/playerClanData.js';

export type StatType = 'player' | 'tank';

export default async function statsfull<Type extends StatType>(
  type: Type,
  { start, end, statsName }: ResolvedPeriod,
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
  } else if (type === 'tank') {
    nameDiscriminator = `(${resolveTankName(tankId)})`;
    image = tankopedia[tankId].images.normal;
  }

  const tankStats = await getTankStatsDiffed(server, id, start, end);
  let stats: AllStats;
  let supplementaryStats: SupplementaryStats;
  let tierWeights: TierWeightsRecord;

  if (type === 'player') {
    const entries = Object.entries(tankStats);
    stats = sumStats(entries.map(([, stats]) => stats));
    const battlesOfTanksWithAverages = entries.reduce(
      (accumulator, [tankIdString, stats]) => {
        const tankId = parseInt(tankIdString);
        const tankAverage = tankAverages[tankId];

        return tankAverage ? accumulator + stats.battles : accumulator;
      },
      0,
    );
    const battlesOfTanksWithTankopediaEntry = entries.reduce(
      (accumulator, [tankIdString, stats]) => {
        const tankId = parseInt(tankIdString);
        const tankopediaEntry = tankopedia[tankId];

        return tankopediaEntry ? accumulator + stats.battles : accumulator;
      },
      0,
    );

    supplementaryStats = {
      WN8:
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);
          const tankAverage = tankAverages[tankId];

          return tankAverage
            ? accumulator + calculateWN8(tankAverage.all, stats) * stats.battles
            : accumulator;
        }, 0) / battlesOfTanksWithAverages,
      tier:
        entries.reduce((accumulator, [tankIdString, stats]) => {
          const tankId = parseInt(tankIdString);
          const tankopediaEntry = tankopedia[tankId];

          return tankopediaEntry
            ? accumulator + tankopediaEntry.tier * stats.battles
            : accumulator;
        }, 0) / battlesOfTanksWithTankopediaEntry,
    };
    tierWeights = entries.reduce<TierWeightsRecord>(
      (accumulator, [tankIdString, stats]) => {
        const tankId = parseInt(tankIdString);
        const tier = tankopedia[tankId].tier as Tier;

        if (accumulator[tier]) {
          accumulator[tier]! += stats.battles;
        } else {
          accumulator[tier] = stats.battles;
        }

        return accumulator;
      },
      {},
    );
  } else {
    stats = tankStats[tankId];

    supplementaryStats = {
      WN8: calculateWN8(tankAverages[tankId].all, tankStats[tankId]),
      tier: tankopedia[tankId].tier,
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
        description={`${statsName} • ${new Date().toDateString()} • ${
          BLITZ_SERVERS[server]
        }`}
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

      <PoweredBy type={PoweredByType.BlitzStars} />
    </Wrapper>
  );
}
