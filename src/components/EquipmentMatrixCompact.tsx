import { Button, Flex } from '@radix-ui/themes';
import { times } from 'lodash';
import { theme } from '../stitches.config';
import { EquipmentMatrix } from '../stores/duel';

interface EquipmentMatrixCompactProps {
  equipmentMatrix: EquipmentMatrix;
}

export function EquipmentMatrixCompact({
  equipmentMatrix,
}: EquipmentMatrixCompactProps) {
  return (
    <Button variant="ghost">
      <Flex gap="1" direction="column">
        {times(3, (y) => (
          <Flex
            style={{
              gap: 6,
            }}
          >
            {times(3, (x) => {
              const equipment = equipmentMatrix[y][x];

              return (
                <Flex
                  style={{
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 8,
                      backgroundColor:
                        equipment === -1
                          ? theme.colors.textLowContrast_green
                          : theme.colors.textLowContrast,
                      borderRadius: 2,
                    }}
                  />
                  <div
                    style={{
                      width: 4,
                      height: 8,
                      backgroundColor:
                        equipment === 1
                          ? theme.colors.textLowContrast_green
                          : theme.colors.textLowContrast,
                      borderRadius: 2,
                    }}
                  />
                </Flex>
              );
            })}
          </Flex>
        ))}
      </Flex>
    </Button>
  );
}
