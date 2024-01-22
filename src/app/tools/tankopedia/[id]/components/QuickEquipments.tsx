import { Flex } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../components/ModuleButton';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../stores/tankopedia';

export function QuickEquipments() {
  const equipment = useTankopediaTemporary((state) => state.model.equipment);

  return (
    <Flex
      justify="end"
      align="center"
      style={{
        width: '100%',
        position: 'absolute',
        right: 12,
        top: 62,
      }}
    >
      <ModuleButton
        selected={equipment.calibratedShells}
        first
        type="equipment"
        rowChild
        equipment={103}
        onClick={() => {
          mutateTankopediaTemporary((draft) => {
            draft.model.equipment.calibratedShells =
              !draft.model.equipment.calibratedShells;
          });
        }}
      />
      <ModuleButton
        selected={equipment.enhancedArmor}
        last
        type="equipment"
        rowChild
        equipment={110}
        onClick={() => {
          mutateTankopediaTemporary((draft) => {
            draft.model.equipment.enhancedArmor =
              !draft.model.equipment.enhancedArmor;
          });
        }}
      />
    </Flex>
  );
}
