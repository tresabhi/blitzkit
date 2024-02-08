import { Flex, Heading } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../../../components/ModuleButton';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Modules() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Modules</Heading>

      <Flex gap="2" wrap="wrap">
        <Flex>
          {protagonist.tank.turrets.map((turret, index) => {
            return (
              <ModuleButton
                key={turret.id}
                selected={protagonist.turret.id === turret.id}
                type="module"
                module="turret"
                discriminator={TIER_ROMAN_NUMERALS[turret.tier]}
                first={index === 0}
                last={index === protagonist.tank.turrets.length - 1}
                rowChild
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.protagonist!.turret = turret;
                    draft.protagonist!.gun = turret.guns.at(-1)!;
                    draft.protagonist!.shell = turret.guns.at(-1)!.shells[0];
                  });
                }}
              />
            );
          })}
        </Flex>

        <Flex>
          {protagonist.turret.guns.map((gun, index) => {
            return (
              <ModuleButton
                key={gun.id}
                type="module"
                module="gun"
                discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                selected={protagonist.gun.id === gun.id}
                first={index === 0}
                last={index === protagonist.turret.guns.length - 1}
                rowChild
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.protagonist!.gun = gun;
                    draft.protagonist!.shell = gun.shells[0];
                  });
                }}
              />
            );
          })}
        </Flex>

        <Flex>
          {protagonist.tank.engines.map((engine, index) => {
            return (
              <ModuleButton
                key={engine.id}
                type="module"
                module="engine"
                discriminator={TIER_ROMAN_NUMERALS[engine.tier]}
                selected={protagonist.engine.id === engine.id}
                first={index === 0}
                last={index === protagonist.tank.engines.length - 1}
                rowChild
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.protagonist!.engine = engine;
                  });
                }}
              />
            );
          })}
        </Flex>

        <Flex>
          {protagonist.tank.tracks.map((track, index) => {
            return (
              <ModuleButton
                key={track.id}
                type="module"
                module="chassis"
                discriminator={TIER_ROMAN_NUMERALS[track.tier]}
                selected={protagonist.track.id === track.id}
                first={index === 0}
                last={index === protagonist.tank.tracks.length - 1}
                rowChild
                onClick={() => {
                  mutateDuel((draft) => {
                    draft.protagonist!.track = track;
                  });
                }}
              />
            );
          })}
        </Flex>
      </Flex>
    </ConfigurationChildWrapper>
  );
}
