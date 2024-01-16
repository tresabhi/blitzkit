import { Flex, Heading } from '@radix-ui/themes';
import { produce } from 'immer';
import { Dispatch, SetStateAction, use } from 'react';
import { ModuleButton } from '../../../../../components/ModuleButton';
import { equipmentDefinitions } from '../../../../../core/blitzkrieg/equipmentDefinitions';
import { Duel } from '../page';

interface ConfigureProps {
  duel: Duel;
  setDuel: Dispatch<SetStateAction<Duel>>;
}

export function Configure({ duel, setDuel }: ConfigureProps) {
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[duel.protagonist.tank.equipment];

  return (
    <Flex gap="6" direction="column">
      <Heading>Configure</Heading>

      <Flex gap="4" direction="column">
        <Heading size="5">Modules</Heading>
        <Flex gap="2">
          <Flex>
            {duel.protagonist.tank.turrets.map((thisTurret, index) => {
              return (
                <ModuleButton
                  key={thisTurret.id}
                  selected={duel.protagonist.turret.id === thisTurret.id}
                  type="module"
                  module="turret"
                  tier={thisTurret.tier}
                  first={index === 0}
                  last={index === duel.protagonist.tank.turrets.length - 1}
                  rowChild
                  onClick={() => {
                    setDuel(
                      produce<Duel>((draft) => {
                        draft.protagonist.turret = thisTurret;
                        draft.protagonist.gun = thisTurret.guns.at(-1)!;
                        draft.protagonist.shell =
                          thisTurret.guns.at(-1)!.shells[0];
                      }),
                    );
                  }}
                />
              );
            })}
          </Flex>

          <Flex>
            {duel.protagonist.turret.guns.map((thisGun, index) => {
              return (
                <ModuleButton
                  key={thisGun.id}
                  type="module"
                  module="gun"
                  tier={thisGun.tier}
                  selected={duel.protagonist.gun.id === thisGun.id}
                  first={index === 0}
                  last={index === duel.protagonist.turret.guns.length - 1}
                  rowChild
                  onClick={() => {
                    setDuel(
                      produce<Duel>((draft) => {
                        draft.protagonist.gun = thisGun;
                        draft.protagonist.shell = thisGun.shells[0];
                      }),
                    );
                  }}
                />
              );
            })}
          </Flex>
        </Flex>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Camouflage</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Consumables</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Provisions</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Equipment</Heading>

        <Flex direction="column" gap="2">
          {equipmentRows.map((equipmentRow) => (
            <Flex gap="2">
              {equipmentRow.map((equipment) => (
                <Flex>
                  <ModuleButton
                    type="equipment"
                    equipment={equipment[0]}
                    first
                    rowChild
                  />
                  <ModuleButton
                    type="equipment"
                    equipment={equipment[1]}
                    last
                    rowChild
                  />
                </Flex>
              ))}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
