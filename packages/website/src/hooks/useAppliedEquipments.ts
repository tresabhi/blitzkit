import { EquipmentPreset } from '@blitzkit/core';
import { EquipmentMatrix } from '../stores/duel';

export function useAppliedEquipments(
  matrix: EquipmentMatrix,
  preset: EquipmentPreset,
) {
  const flatMatrix = matrix.flat();
  return preset
    .flat()
    .map((options, index) => options[flatMatrix[index] == 1 ? 1 : 0]);
}
