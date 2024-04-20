import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { EquipmentManager } from '../../../../../../../components/EquipmentManager';
import { equipmentDefinitions } from '../../../../../../../core/blitzrinth/equipmentDefinitions';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Equipment() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentPreset =
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

      <EquipmentManager
        matrix={equipmentMatrix}
        preset={equipmentPreset}
        onChange={(matrix) => {
          mutateDuel((draft) => {
            draft.protagonist!.equipmentMatrix = matrix;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
