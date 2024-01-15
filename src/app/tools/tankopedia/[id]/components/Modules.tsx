import { Flex } from '@radix-ui/themes';
import { produce } from 'immer';
import { Dispatch, SetStateAction } from 'react';
import { ModuleButton } from '../../../../../components/ModuleButton';
import { Duel } from '../page';

interface ModulesProps {
  duel: Duel;
  setDuel: Dispatch<SetStateAction<Duel>>;
}

export function Modules({ duel, setDuel }: ModulesProps) {
  return (
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
                    draft.protagonist.shell = thisTurret.guns.at(-1)!.shells[0];
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
  );
}
