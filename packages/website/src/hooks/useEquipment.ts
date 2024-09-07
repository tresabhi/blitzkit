import { use, useMemo } from 'react';
import * as Duel from '../../packages/website/src/stores/duel';
import { equipmentDefinitions } from '../core/blitzkit/equipmentDefinitions';

export function useEquipment(id: number, antagonist = false) {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const member = Duel.use(
    (state) => state[antagonist ? 'antagonist' : 'protagonist']!,
  );
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[member.tank.equipment];
  const equipmentMatrix = Duel.use(
    (state) =>
      state[antagonist ? 'antagonist' : 'protagonist']!.equipmentMatrix,
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
