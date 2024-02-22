import { use, useMemo } from 'react';
import { equipmentDefinitions } from '../core/blitzkrieg/equipmentDefinitions';
import { useDuel } from '../stores/duel';

export function useEquipment(id: number, antagonist = false) {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const member = useDuel(
    (state) => state[antagonist ? 'antagonist' : 'protagonist']!,
  );
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[member.tank.equipment];
  const equipmentMatrix = useDuel(
    (state) => state[antagonist ? 'antagonist' : 'protagonist']!.equipment,
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
    [equipmentMatrix, member.tank],
  );

  return value;
}
