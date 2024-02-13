import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { EquipmentButton } from '../../../../../../../components/ModuleButtons/EquipmentButton';
import { equipmentDefinitions } from '../../../../../../../core/blitzkrieg/equipmentDefinitions';
import { useDuel } from '../../../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Equipments() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = useTankopediaTemporary(
    (state) => state.equipmentMatrix,
  );

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Equipments</Heading>

      <Flex direction="column" gap="2">
        {equipmentRows.map((equipmentRow, rowIndex) => (
          <Flex gap="2" key={rowIndex}>
            {equipmentRow.map((equipment, columnIndex) => (
              <Flex key={columnIndex}>
                <EquipmentButton
                  equipment={equipment[0]}
                  first
                  rowChild
                  selected={equipmentMatrix[rowIndex][columnIndex] === -1}
                  onClick={() => {
                    mutateTankopediaTemporary((draft) => {
                      if (equipmentMatrix[rowIndex][columnIndex] === -1) {
                        draft.equipmentMatrix[rowIndex][columnIndex] = 0;
                      } else {
                        draft.equipmentMatrix[rowIndex][columnIndex] = -1;
                      }
                    });
                  }}
                />
                <EquipmentButton
                  equipment={equipment[1]}
                  last
                  rowChild
                  selected={equipmentMatrix[rowIndex][columnIndex] === 1}
                  onClick={() => {
                    mutateTankopediaTemporary((draft) => {
                      if (equipmentMatrix[rowIndex][columnIndex] === 1) {
                        draft.equipmentMatrix[rowIndex][columnIndex] = 0;
                      } else {
                        draft.equipmentMatrix[rowIndex][columnIndex] = 1;
                      }
                    });
                  }}
                />
              </Flex>
            ))}
          </Flex>
        ))}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
