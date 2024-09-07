import { EquipmentMatrix } from '../../packages/website/src/stores/duel';
import { EquipmentPreset } from '../core/blitzkit/equipmentDefinitions';

export function useAppliedEquipments(
  matrix: EquipmentMatrix,
  preset: EquipmentPreset,
) {
  const flatMatrix = matrix.flat();
  return preset
    .flat()
    .map((options, index) => options[flatMatrix[index] == 1 ? 1 : 0]);
}
