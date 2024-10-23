import { Vector3Tuple } from 'three';
import { Tier } from '../protos';

export const equipmentPriceMatrix: Record<Tier, Vector3Tuple> = {
  [Tier.I]: [100, 200, 300],
  [Tier.II]: [200, 300, 400],
  [Tier.III]: [400, 500, 600],
  [Tier.IV]: [4000, 5000, 6000],
  [Tier.V]: [40_000, 50_000, 60_000],
  [Tier.VI]: [100_000, 120_000, 140_000],
  [Tier.VII]: [150_000, 170_000, 190_000],
  [Tier.VIII]: [200_000, 225_000, 250_000],
  [Tier.IX]: [250_000, 275_000, 300_000],
  [Tier.X]: [300_000, 350_000, 400_000],
};
