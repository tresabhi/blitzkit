import { EquipmentPreset } from '../core/blitzkrieg/equipmentDefinitions';
import { EquipmentMatrix } from '../stores/tankopedia';

export function useAppliedEquipments(
  matrix: EquipmentMatrix,
  preset: EquipmentPreset,
) {
  const flatMatrix = matrix.flat();
  return preset.flat().map((options, index) => options[flatMatrix[index] == 1 ? 1 : 0]);
}
