import { Button, DropdownMenu, Flex, Heading } from '@radix-ui/themes';
import { useState } from 'react';
import { ModuleButton } from '../../../../../../../components/ModuleButtons/ModuleButton';
import { TIER_ROMAN_NUMERALS } from '../../../../../../../core/blitzkrieg/tankDefinitions/constants';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { mutateTankopediaTemporary } from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Modules() {
  const protagonist = useDuel((state) => state.protagonist!);
  const hasUpgrades =
    protagonist.tank.turrets.length > 1 ||
    protagonist.tank.turrets[0].guns.length > 1 ||
    protagonist.tank.engines.length > 1 ||
    protagonist.tank.tracks.length > 1;
  const [turretMenuOpen, setTurretMenuOpen] = useState(false);
  const [gunMenuOpen, setGunMenuOpen] = useState(false);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const [trackMenuOpen, setTrackMenuOpen] = useState(false);

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Modules</Heading>
        {hasUpgrades && (
          <>
            <Button
              variant="ghost"
              color="red"
              onClick={() => {
                mutateDuel((draft) => {
                  draft.protagonist!.turret =
                    draft.protagonist!.tank.turrets[0];
                  draft.protagonist!.gun = draft.protagonist!.turret.guns[0];
                  draft.protagonist!.shell = draft.protagonist!.gun.shells[0];
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines[0];
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
                  draft.protagonist!.gun =
                    draft.protagonist!.turret.guns.at(-1)!;
                  draft.protagonist!.shell =
                    draft.protagonist!.gun.shells.at(-1)!;
                  draft.protagonist!.engine =
                    draft.protagonist!.tank.engines.at(-1)!;
                  draft.protagonist!.track =
                    draft.protagonist!.tank.tracks.at(-1)!;
                });
              }}
            >
              Upgrade
            </Button>
          </>
        )}
      </Flex>

      <Flex gap="1" wrap="wrap">
        <ModuleButton
          module="turret"
          discriminator={TIER_ROMAN_NUMERALS[protagonist.turret.tier]}
          first
          last
          rowChild
          onClick={() => setTurretMenuOpen(true)}
        />

        <DropdownMenu.Root
          open={turretMenuOpen}
          onOpenChange={setTurretMenuOpen}
        >
          <DropdownMenu.Trigger>
            <div />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value={`${protagonist.turret.id}`}>
              {[...protagonist.tank.turrets].reverse().map((turret) => {
                return (
                  <DropdownMenu.RadioItem
                    key={turret.id}
                    value={`${turret.id}`}
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.turret = turret;
                        draft.protagonist!.gun = turret.guns.at(-1)!;
                        draft.protagonist!.shell =
                          turret.guns.at(-1)!.shells[0];
                      });
                      mutateTankopediaTemporary((draft) => {
                        draft.shot = undefined;
                      });
                      setTurretMenuOpen(false);
                    }}
                  >
                    <ModuleButton
                      variant="ghost"
                      module="turret"
                      discriminator={TIER_ROMAN_NUMERALS[turret.tier]}
                    />{' '}
                    {turret.name}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <ModuleButton
          module="gun"
          discriminator={TIER_ROMAN_NUMERALS[protagonist.gun.tier]}
          first
          last
          rowChild
          onClick={() => setGunMenuOpen(true)}
        />

        <DropdownMenu.Root open={gunMenuOpen} onOpenChange={setGunMenuOpen}>
          <DropdownMenu.Trigger>
            <div />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value={`${protagonist.gun.id}`}>
              {[...protagonist.turret.guns].reverse().map((gun) => {
                return (
                  <DropdownMenu.RadioItem
                    key={gun.id}
                    value={`${gun.id}`}
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.gun = gun;
                        draft.protagonist!.shell = gun.shells[0];
                      });
                    }}
                  >
                    <ModuleButton
                      variant="ghost"
                      module="gun"
                      discriminator={TIER_ROMAN_NUMERALS[gun.tier]}
                    />{' '}
                    {gun.name}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <ModuleButton
          module="engine"
          discriminator={TIER_ROMAN_NUMERALS[protagonist.engine.tier]}
          first
          last
          rowChild
          onClick={() => setEngineMenuOpen(true)}
        />

        <DropdownMenu.Root
          open={engineMenuOpen}
          onOpenChange={setEngineMenuOpen}
        >
          <DropdownMenu.Trigger>
            <div />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value={`${protagonist.engine.id}`}>
              {[...protagonist.tank.engines].reverse().map((engine) => {
                return (
                  <DropdownMenu.RadioItem
                    key={engine.id}
                    value={`${engine.id}`}
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.engine = engine;
                      });
                    }}
                  >
                    <ModuleButton
                      variant="ghost"
                      module="engine"
                      discriminator={TIER_ROMAN_NUMERALS[engine.tier]}
                    />{' '}
                    {engine.name}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <ModuleButton
          module="chassis"
          discriminator={TIER_ROMAN_NUMERALS[protagonist.track.tier]}
          first
          last
          rowChild
          onClick={() => setTrackMenuOpen(true)}
        />

        <DropdownMenu.Root open={trackMenuOpen} onOpenChange={setTrackMenuOpen}>
          <DropdownMenu.Trigger>
            <div />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            <DropdownMenu.RadioGroup value={`${protagonist.track.id}`}>
              {[...protagonist.tank.tracks].reverse().map((track) => {
                return (
                  <DropdownMenu.RadioItem
                    key={track.id}
                    value={`${track.id}`}
                    onClick={() => {
                      mutateDuel((draft) => {
                        draft.protagonist!.track = track;
                      });
                    }}
                  >
                    <ModuleButton
                      variant="ghost"
                      module="chassis"
                      discriminator={TIER_ROMAN_NUMERALS[track.tier]}
                    />{' '}
                    {track.name}
                  </DropdownMenu.RadioItem>
                );
              })}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </ConfigurationChildWrapper>
  );
}
