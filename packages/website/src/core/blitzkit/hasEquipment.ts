import { equipmentDefinitions } from '@blitzkit/core';
import { EquipmentMatrix } from '../../stores/duel';

export async function hasEquipment(
  id: number,
  equipmentPreset: string,
  equipmentMatrix: EquipmentMatrix,
) {
  const awaitedEquipmentDefinitions = await equipmentDefinitions;
  const presetRows = awaitedEquipmentDefinitions.presets[equipmentPreset];
  return presetRows.some((equipmentRow, rowIndex) => {
    return equipmentRow.some((equipment, columnIndex) => {
      const choice = equipmentMatrix[rowIndex][columnIndex];
      if (choice === 0) return false;
      const equipped = equipment[choice === -1 ? 0 : 1];
      return equipped === id;
    });
  });
}
