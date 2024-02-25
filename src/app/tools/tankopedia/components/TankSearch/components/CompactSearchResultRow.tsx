import { Button, Flex, Text } from '@radix-ui/themes';
import { SmallTankIcon } from '../../../../../../components/SmallTankIcon';
import {
  TIER_ROMAN_NUMERALS,
  TankDefinition,
} from '../../../../../../core/blitzkrieg/tankDefinitions';

interface CompactSearchResultRowProps {
  tanks: TankDefinition[];
  onSelect: (tank: TankDefinition) => void;
}

export function CompactSearchResultRow({
  tanks,
  onSelect = () => {},
}: CompactSearchResultRowProps) {
  return (
    <Flex justify="center">
      <Flex direction="column" gap="2" align="start">
        {tanks.map((tank) => (
          <Button
            key={tank.id}
            variant="ghost"
            style={{ width: '100%' }}
            onClick={() => onSelect(tank)}
          >
            <Flex gap="2" align="start" style={{ width: '100%' }}>
              <Text align="right" color="gray" style={{ width: 24 }}>
                {TIER_ROMAN_NUMERALS[tank.tier]}
              </Text>

              <Text color={tank.treeType === 'collector' ? 'blue' : 'amber'}>
                <Flex gap="2" align="center">
                  <SmallTankIcon id={tank.id} size={16} />

                  <div
                    style={{
                      display: 'block',
                      color:
                        tank.treeType === 'researchable' ? 'white' : undefined,
                    }}
                  >
                    {tank.name}
                  </div>
                </Flex>
              </Text>
            </Flex>
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}
