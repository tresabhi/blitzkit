import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ModuleButton } from '../../../../../components/ModuleButton';
import { equipmentDefinitions } from '../../../../../core/blitzkrieg/equipmentDefinitions';
import { mutateDuel, useDuel } from '../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../stores/tankopedia';

export function Configure() {
  const protagonist = useDuel((state) => state.protagonist!);
  const awaitedEquipmentDefinitions = use(equipmentDefinitions);
  const equipmentRows =
    awaitedEquipmentDefinitions.presets[protagonist.tank.equipment];
  const equipmentMatrix = useTankopediaTemporary(
    (state) => state.equipmentMatrix,
  );

  return (
    <Flex gap="4" direction="column">
      <Heading>Configure</Heading>

      <Flex gap="4" justify="between" wrap="wrap">
        <Flex gap="2" direction="column">
          <Heading size="4">Modules</Heading>

          <Flex gap="2">
            <Flex>
              {protagonist.tank.turrets.map((thisTurret, index) => {
                return (
                  <ModuleButton
                    key={thisTurret.id}
                    selected={protagonist.turret.id === thisTurret.id}
                    type="module"
                    module="turret"
                    tier={thisTurret.tier}
                    first={index === 0}
                    last={index === protagonist.tank.turrets.length - 1}
                    rowChild
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.turret = thisTurret;
                        draft.protagonist!.gun = thisTurret.guns.at(-1)!;
                        draft.protagonist!.shell =
                          thisTurret.guns.at(-1)!.shells[0];
                      });
                    }}
                  />
                );
              })}
            </Flex>

            <Flex>
              {protagonist.turret.guns.map((thisGun, index) => {
                return (
                  <ModuleButton
                    key={thisGun.id}
                    type="module"
                    module="gun"
                    tier={thisGun.tier}
                    selected={protagonist.gun.id === thisGun.id}
                    first={index === 0}
                    last={index === protagonist.turret.guns.length - 1}
                    rowChild
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.gun = thisGun;
                        draft.protagonist!.shell = thisGun.shells[0];
                      });
                    }}
                  />
                );
              })}
            </Flex>
          </Flex>
        </Flex>

        <Flex gap="2" direction="column">
          <Heading size="4">Equipment</Heading>

          <Flex direction="column" gap="2">
            {equipmentRows.map((equipmentRow, rowIndex) => (
              <Flex gap="2" key={rowIndex}>
                {equipmentRow.map((equipment, columnIndex) => (
                  <Flex key={columnIndex}>
                    <ModuleButton
                      type="equipment"
                      equipment={equipment[0]}
                      first
                      rowChild
                      selected={equipmentMatrix[rowIndex][columnIndex] === 0}
                      onClick={() => {
                        mutateTankopediaTemporary((draft) => {
                          draft.equipmentMatrix[rowIndex][columnIndex] = 0;
                        });
                      }}
                    />
                    <ModuleButton
                      type="equipment"
                      equipment={equipment[1]}
                      last
                      rowChild
                      selected={equipmentMatrix[rowIndex][columnIndex] === 1}
                      onClick={() => {
                        mutateTankopediaTemporary((draft) => {
                          draft.equipmentMatrix[rowIndex][columnIndex] = 1;
                        });
                      }}
                    />
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Flex gap="2" direction="column">
          <Heading size="4">Consumables</Heading>
        </Flex>
      </Flex>

      {/*
      <Flex gap="4" direction="column">
        <Heading size="5">Camouflage</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Consumables</Heading>
      </Flex>

      <Flex gap="4" direction="column">
        <Heading size="5">Provisions</Heading>
      </Flex> */}
    </Flex>
  );
}
