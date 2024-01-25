import { Flex, Heading } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../../../components/ModuleButton';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';

export function Modules() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
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
                discriminator={TIER_ROMAN_NUMERALS[thisTurret.tier]}
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
                discriminator={TIER_ROMAN_NUMERALS[thisGun.tier]}
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
  );
}
