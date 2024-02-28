import { useDuel } from '../../stores/duel';
import { equipmentDefinitions } from './equipmentDefinitions';

export async function hasEquipment(
  id: number,
  antagonist = false,
  equipmentMatrix = useDuel.getState()[
    antagonist ? 'antagonist' : 'protagonist'
  ]!.equipment,
) {
  const awaitedEquipmentDefinitions = await equipmentDefinitions;
  const member = useDuel.getState()[antagonist ? 'antagonist' : 'protagonist']!;
  const presetRows = awaitedEquipmentDefinitions.presets[member.tank.equipment];
  return presetRows.some((equipmentRow, rowIndex) => {
    return equipmentRow.some((equipment, columnIndex) => {
      const choice = equipmentMatrix[rowIndex][columnIndex];
      if (choice === 0) return false;
      const equipped = equipment[choice === -1 ? 0 : 1];
      return equipped === id;
    });
  });
}
