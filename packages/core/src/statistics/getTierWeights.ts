import { TierWeightsRecord } from '../../../bot/src/components/TierWeights';
import { tankDefinitions } from '../blitzkit/tankDefinitions';
import { BlitzStats } from './compositeStats/constants';

export async function getTierWeights(
  stats: Record<number, BlitzStats>,
  order: number[] = Object.keys(stats).map(parseInt),
) {
  const awaitedTankDefinitions = await tankDefinitions;
  const tierWeights: TierWeightsRecord = {};

  order.forEach((id) => {
    const entry = awaitedTankDefinitions[id];

    if (!entry) return;
    if (!tierWeights[entry.tier]) tierWeights[entry.tier] = 0;

    tierWeights[entry.tier]! += stats[id].battles;
  });

  return tierWeights;
}
