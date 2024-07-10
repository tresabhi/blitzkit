import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { EquipmentManager } from '../../../../../../../components/EquipmentManager';
import { equipmentDefinitions } from '../../../../../../../core/blitzkit/equipmentDefinitions';
import * as Duel from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Equipment() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentPreset =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = Duel.use(
    (state) => state.protagonist.equipmentMatrix,
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
              draft.protagonist.equipmentMatrix.forEach((row) => {
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
            draft.protagonist.equipmentMatrix = matrix;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
