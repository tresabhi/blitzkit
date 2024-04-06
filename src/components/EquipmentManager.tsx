import { Flex } from '@radix-ui/themes';
import { cloneDeep } from 'lodash';
import { EquipmentPreset } from '../core/blitzkrieg/equipmentDefinitions';
import { EquipmentMatrix } from '../stores/duel';
import { EquipmentButton } from './ModuleButtons/EquipmentButton';

interface EquipmentManagerProps {
  preset: EquipmentPreset;
  matrix: EquipmentMatrix;
  onChange: (matrix: EquipmentMatrix) => void;
}

export function EquipmentManager({
  preset,
  matrix,
  onChange,
}: EquipmentManagerProps) {
  return (
    <Flex direction="column" gap="2">
      {preset.map((equipmentRow, rowIndex) => (
        <Flex gap="2" key={rowIndex}>
          {equipmentRow.map((equipment, columnIndex) => (
            <Flex key={columnIndex}>
              <EquipmentButton
                equipment={equipment[0]}
                first
                rowChild
                selected={matrix[rowIndex][columnIndex] === -1}
                onClick={() => {
                  const draft = cloneDeep(matrix);

                  if (draft[rowIndex][columnIndex] === -1) {
                    draft[rowIndex][columnIndex] = 0;
                  } else {
                    draft[rowIndex][columnIndex] = -1;
                  }

                  onChange(draft);
                }}
              />
              <EquipmentButton
                equipment={equipment[1]}
                last
                rowChild
                selected={matrix[rowIndex][columnIndex] === 1}
                onClick={() => {
                  const draft = cloneDeep(matrix);

                  if (draft[rowIndex][columnIndex] === 1) {
                    draft[rowIndex][columnIndex] = 0;
                  } else {
                    draft[rowIndex][columnIndex] = 1;
                  }

                  onChange(draft);
                }}
              />
            </Flex>
          ))}
        </Flex>
      ))}
    </Flex>
  );
}
