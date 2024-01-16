import { Button, Dialog, Flex, Text } from '@radix-ui/themes';
import { produce } from 'immer';
import { Dispatch, SetStateAction, use } from 'react';
import { SmallTankIcon } from '../../../../../../../components/SmallTankIcon';
import {
  TIER_ROMAN_NUMERALS,
  tankDefinitions,
} from '../../../../../../../core/blitzkrieg/tankDefinitions';
import { Duel } from '../../../page';

interface SearchResultsProps {
  ids: number[];
  setDuel: Dispatch<SetStateAction<Duel>>;
}

export function SearchResults({ ids, setDuel }: SearchResultsProps) {
  const awaitedTankDefinitions = use(tankDefinitions);

  return (
    <Flex justify="center">
      <Flex direction="column" gap="2" align="start">
        {ids.map((id) => {
          const tank = awaitedTankDefinitions[id];

          return (
            <Dialog.Close>
              <Button
                key={id}
                variant="ghost"
                style={{ width: '100%' }}
                onClick={() => {
                  setDuel(
                    produce<Duel>((draft) => {
                      draft.antagonist.tank = tank;
                      draft.antagonist.turret = tank.turrets.at(-1)!;
                      draft.antagonist.gun =
                        draft.antagonist.turret.guns.at(-1)!;
                      draft.antagonist.shell = draft.antagonist.gun.shells[0];
                    }),
                  );
                }}
              >
                <Flex gap="2" align="start" style={{ width: '100%' }}>
                  <Text align="right" color="gray" style={{ width: 24 }}>
                    {TIER_ROMAN_NUMERALS[tank.tier]}
                  </Text>

                  <Text
                    color={tank.tree_type === 'collector' ? 'blue' : 'amber'}
                  >
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
            </Dialog.Close>
          );
        })}
      </Flex>
    </Flex>
  );
}
