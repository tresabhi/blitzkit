import { Card, Code, Flex, Text, TextField } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';
import { resolveArmorIndex } from '../../../core/blitzkit/resolveArmorIndex';
import * as App from '../../../stores/app';
import * as Duel from '../../../stores/duel';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import { layerTypeNames } from './ShotDisplayCard';
import { ArmorType } from './SpacedArmorScene';

export function ArmorPlateDisplay() {
  const highlightArmor = TankopediaEphemeral.use(
    (state) => state.highlightArmor,
  );
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const developerMode = App.use((state) => state.developerMode);
  const devThicknessInput = useRef<HTMLInputElement>(null);
  const duelStore = Duel.useStore();
  const input = useRef<HTMLInputElement>(null);

  if (highlightArmor === undefined) return null;

  return (
    <group position={highlightArmor.point}>
      <Html
        center
        style={{ pointerEvents: highlightArmor.editingPlate ? 'auto' : 'none' }}
      >
        <Card
          mb="4"
          style={{
            whiteSpace: 'nowrap',
            color: highlightArmor.color,
            transform: 'translateY(-50%)',
          }}
        >
          <Flex direction="column">
            <Text weight="bold">
              {layerTypeNames[highlightArmor.type]}{' '}
              {highlightArmor.thickness.toFixed(0)}
              <Text size="1" weight="regular">
                mm
              </Text>
            </Text>

            {highlightArmor.type !== ArmorType.External && (
              <Text size="2" color="gray">
                {highlightArmor.thicknessAngled.toFixed(0)}
                <Text size="1">
                  mm {radToDeg(highlightArmor.angle).toFixed(0)}°
                </Text>
              </Text>
            )}

            {developerMode && (
              <>
                <Text mt="2" color="gray" size="2">
                  <b>DEV:</b> <Code>{highlightArmor.name}</Code>
                </Text>
              </>
            )}

            {highlightArmor.editingPlate && (
              <TextField.Root
                mt="2"
                ref={input}
                type="number"
                autoFocus
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if (!highlightArmor.editingPlate) return;

                  const index = resolveArmorIndex(highlightArmor.name);

                  if (index === undefined) return;

                  const thickness = event.currentTarget.valueAsNumber;

                  if (isNaN(thickness) || thickness < 0) return;

                  if (event.key === 'Enter') {
                    input.current?.blur();

                    mutateTankopediaEphemeral((draft) => {
                      draft.highlightArmor = undefined;
                      const { protagonist } = duelStore.getState();
                      const tank = draft.model;
                      const turret = tank.turrets[protagonist.turret.id];
                      const gun = turret.guns[protagonist.gun.id];
                      const track = tank.tracks[protagonist.track.id];

                      console.log(highlightArmor.name);
                      if (highlightArmor.name.startsWith('hull_')) {
                        tank.armor.thickness[index] = thickness;
                      } else if (highlightArmor.name.startsWith('turret_')) {
                        turret.armor.thickness[index] = thickness;
                      } else if (highlightArmor.name.startsWith('gun_')) {
                        if (highlightArmor.name.includes('_armor_')) {
                          gun.armor.thickness[index] = thickness;
                        } else {
                          gun.thickness = thickness;
                        }
                      } else if (highlightArmor.name.startsWith('chassis_')) {
                        track.thickness = thickness;
                      }
                    });
                  } else if (event.key === 'Escape') {
                    input.current?.blur();
                    mutateTankopediaEphemeral((draft) => {
                      draft.highlightArmor = undefined;
                    });
                  }
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
                defaultValue={highlightArmor.thickness.toFixed(0)}
              >
                <TextField.Slot side="right">mm</TextField.Slot>
              </TextField.Root>
            )}
          </Flex>
        </Card>
      </Html>
    </group>
  );
}
