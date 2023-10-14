import { AllStats } from '../../_core/blitz/getAccountInfo';
import { TierWeightsRecord } from '../../components/TierWeights';
import { tankopedia } from '../blitz/tankopedia';

export async function getTierWeights(
  stats: Record<number, AllStats>,
  order: number[] = Object.keys(stats).map(parseInt),
) {
  const awaitedTankopedia = await tankopedia;
  const tierWeights: TierWeightsRecord = {};

  order.map((id) => {
    const entry = awaitedTankopedia[id];

    if (!entry) return;
    if (!tierWeights[entry.tier]) tierWeights[entry.tier] = 0;

    tierWeights[entry.tier]! += stats[id].battles;
  });

  return tierWeights;
}
