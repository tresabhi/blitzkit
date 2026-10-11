import { characteristicsGroups } from "../config/characteristicsGroups";
import {
  CharacteristicRanking as CharacteristicRankingDirection,
  type CharacteristicName,
  type CharacteristicRenderConfig,
  type ComputedCharacteristics,
} from "../types/characteristics";

const characteristicConfigs = new Map<
  CharacteristicName,
  CharacteristicRenderConfig
>();

for (const { order } of characteristicsGroups) {
  for (const item of order) {
    if (!("name" in item)) continue;
    characteristicConfigs.set(item.name, item);
  }
}

export interface CharacteristicRank {
  rank: number;
  total: number;
  score: number;
}

export function calculateRankings(
  characteristics: ComputedCharacteristics,
  comparisons: ComputedCharacteristics[],
) {
  const rankings = new Map<CharacteristicName, CharacteristicRank>();

  for (const [name, value] of characteristics) {
    if (typeof value !== "number" || name[0] !== "_") continue;

    const config = characteristicConfigs.get(name)!;

    if (config.ranking === CharacteristicRankingDirection.None) continue;

    const lowerIsBetter =
      config.ranking === CharacteristicRankingDirection.LowerIsBetter;

    const values = comparisons
      .map((comparison) => comparison.get(name))
      .filter((other) => typeof other === "number");

    if (values.length === 0) continue;

    const betterCount = values.filter((other) =>
      lowerIsBetter ? other < value : other > value,
    ).length;

    rankings.set(name, {
      rank: Math.min(betterCount + 1, values.length),
      total: values.length,
      score: (values.length - betterCount) / values.length,
    });
  }

  return rankings;
}
