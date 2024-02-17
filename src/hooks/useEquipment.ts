import { use, useMemo } from 'react';
import { equipmentDefinitions } from '../core/blitzkrieg/equipmentDefinitions';
import { useDuel } from '../stores/duel';
import { useTankopediaTemporary } from '../stores/tankopedia';

export function useEquipment(id: number) {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const protagonist = useDuel((state) => state.protagonist!);
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = useTankopediaTemporary(
    (state) => state.equipmentMatrix,
  );
  const value = useMemo(
    () =>
      equipmentRows.some((equipmentRow, rowIndex) => {
        return equipmentRow.some((equipment, columnIndex) => {
          const choice = equipmentMatrix[rowIndex][columnIndex];
          if (choice === 0) return false;
          const equipped = equipment[choice === -1 ? 0 : 1];
          return equipped === id;
        });
      }),
    [equipmentMatrix, protagonist.tank],
  );

  return value;
}
