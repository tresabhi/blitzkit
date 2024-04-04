import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { EquipmentButton } from '../../../../../../../components/ModuleButtons/EquipmentButton';
import { equipmentDefinitions } from '../../../../../../../core/blitzkrieg/equipmentDefinitions';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Equipment() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = useDuel(
    (state) => state.protagonist!.equipmentMatrix,
  );

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Equipment</Heading>
        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist!.equipmentMatrix.forEach((row) => {
                row.forEach((_, index) => {
                  row[index] = 0;
                });
              });
            });
          }}
        >
          Clear
        </Button>
      </Flex>

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
                    mutateDuel((draft) => {
                      if (equipmentMatrix[rowIndex][columnIndex] === -1) {
                        draft.protagonist!.equipmentMatrix[rowIndex][
                          columnIndex
                        ] = 0;
                      } else {
                        draft.protagonist!.equipmentMatrix[rowIndex][
                          columnIndex
                        ] = -1;
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
                    mutateDuel((draft) => {
                      if (equipmentMatrix[rowIndex][columnIndex] === 1) {
                        draft.protagonist!.equipmentMatrix[rowIndex][
                          columnIndex
                        ] = 0;
                      } else {
                        draft.protagonist!.equipmentMatrix[rowIndex][
                          columnIndex
                        ] = 1;
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
