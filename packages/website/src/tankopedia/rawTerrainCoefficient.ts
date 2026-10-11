import type { CharacteristicScript } from "../types/characteristics";

export function rawTerrainCoefficient(
  resistance: number,
  passabilityAttribute: string,
  driverCoefficient: number,
  script: CharacteristicScript,
) {
  let passabilityIncrease = 0;
  let terrainResistanceFactor = 1;

  script("protagonist", "Grousers", (effect) => {
    passabilityIncrease +=
      (effect.bonusPercentage?.[passabilityAttribute] ?? 0) / 100;
  });

  script("protagonist", "AttributesModifier", (effect) => {
    passabilityIncrease +=
      (effect.attributes?.[passabilityAttribute] ?? 0) / 100;
  });

  script("protagonist", "AfterburnerAbility", (effect) => {
    terrainResistanceFactor *= effect.bonusValues?.terrainResistanceFactor ?? 1;
  });

  return (
    resistance *
    (1 - passabilityIncrease) *
    terrainResistanceFactor *
    driverCoefficient
  );
}
