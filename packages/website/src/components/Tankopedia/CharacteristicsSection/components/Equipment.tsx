import { equipmentDefinitions } from '@blitzkit/core';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { Duel } from '../../../../stores/duel';
import { EquipmentManager } from '../../../EquipmentManager';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

const awaitedEquipmentDefinitions = await equipmentDefinitions;

export function Equipment() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist);
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
