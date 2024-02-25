import { useDuel } from '../../stores/duel';
import { equipmentDefinitions } from './equipmentDefinitions';

export async function hasEquipment(id: number, antagonist = false) {
  const awaitedEquipmentDefinitions = await equipmentDefinitions;
  const member = useDuel.getState()[antagonist ? 'antagonist' : 'protagonist']!;
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[member.tank.equipment];
  const equipmentMatrix =
    useDuel.getState()[antagonist ? 'antagonist' : 'protagonist']!.equipment;

  return equipmentRows.some((equipmentRow, rowIndex) => {
    return equipmentRow.some((equipment, columnIndex) => {
      const choice = equipmentMatrix[rowIndex][columnIndex];
      if (choice === 0) return false;
      const equipped = equipment[choice === -1 ? 0 : 1];
      return equipped === id;
    });
  });
}
