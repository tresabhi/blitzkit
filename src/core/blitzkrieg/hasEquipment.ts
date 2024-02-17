import { useDuel } from '../../stores/duel';
import { useTankopediaTemporary } from '../../stores/tankopedia';
import { equipmentDefinitions } from './equipmentDefinitions';

export async function hasEquipment(id: number) {
  const awaitedEquipmentDefinitions = await equipmentDefinitions;
  const protagonist = useDuel.getState().protagonist!;
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = useTankopediaTemporary.getState().equipmentMatrix;

  return equipmentRows.some((equipmentRow, rowIndex) => {
    return equipmentRow.some((equipment, columnIndex) => {
      const choice = equipmentMatrix[rowIndex][columnIndex];
      if (choice === 0) return false;
      const equipped = equipment[choice === -1 ? 0 : 1];
      return equipped === id;
    });
  });
}
