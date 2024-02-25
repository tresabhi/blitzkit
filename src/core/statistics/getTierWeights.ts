import { TierWeightsRecord } from '../../components/TierWeights';
import { AllStats } from '../blitz/getAccountInfo';
import { tankDefinitions } from '../blitzkrieg/tankDefinitions';

export async function getTierWeights(
  stats: Record<number, AllStats>,
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
