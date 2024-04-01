import { Button, Flex, Heading } from '@radix-ui/themes';
import { ModuleButton } from '../../../../../../../components/ModuleButtons/ModuleButton';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions/constants';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Modules() {
  const protagonist = useDuel((state) => state.protagonist!);

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Modules</Heading>
        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist!.turret = draft.protagonist!.tank.turrets[0];
              draft.protagonist!.gun = draft.protagonist!.turret.guns[0];
              draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
              draft.protagonist!.engine = draft.protagonist!.tank.engines[0];
              draft.protagonist!.track = draft.protagonist!.tank.tracks[0];
            });
          }}
        >
          Stock
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist!.turret =
                draft.protagonist!.tank.turrets.at(-1)!;
              draft.protagonist!.gun = draft.protagonist!.turret.guns.at(-1)!;
              draft.protagonist!.shell = draft.protagonist!.gun.shells.at(-1)!;
              draft.protagonist!.engine =
                draft.protagonist!.tank.engines.at(-1)!;
              draft.protagonist!.track = draft.protagonist!.tank.tracks.at(-1)!;
            });
          }}
        >
          Upgrade
        </Button>
      </Flex>

      <Flex gap="2" wrap="wrap">
        <Flex>
          {protagonist.tank.turrets.map((turret, index) => {
            return (
              <ModuleButton
                key={turret.id}
                selected={protagonist.turret.id === turret.id}
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
                  mutateTankopediaTemporary((draft) => {
                    draft.shot = undefined;
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
