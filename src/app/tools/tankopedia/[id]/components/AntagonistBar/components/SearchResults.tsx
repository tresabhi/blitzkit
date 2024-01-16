import { Button, Flex, Text } from '@radix-ui/themes';
import { use } from 'react';
import { SmallTankIcon } from '../../../../../../../components/SmallTankIcon';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
} from '../../../../../../../core/blitzkrieg/tankDefinitions';

interface SearchResultsProps {
  ids: number[];
}

export function SearchResults({ ids }: SearchResultsProps) {
  const awaitedTankDefinitions = use(tankDefinitions);

  return (
    <Flex justify="center">
      <Flex direction="column" gap="2" align="start">
        {ids.map((id) => {
          const tank = awaitedTankDefinitions[id];

          return (
            <Button key={id} variant="ghost" style={{ width: '100%' }}>
              <Flex gap="2" align="start" style={{ width: '100%' }}>
                <Text align="right" color="gray" style={{ width: 24 }}>
                  {TIER_ROMAN_NUMERALS[tank.tier]}
                </Text>

                <Text color={tank.tree_type === 'collector' ? 'blue' : 'amber'}>
                  <Flex gap="2" align="center">
                    <SmallTankIcon id={tank.id} size={16} />

                    <div
                      style={{
                        display: 'block',
                        color:
                          tank.tree_type === 'researchable'
                            ? 'white'
                            : undefined,
                      }}
                    >
                      {tank.name}
                    </div>
                  </Flex>
                </Text>
              </Flex>
            </Button>
          );
        })}
      </Flex>
    </Flex>
  );
}
