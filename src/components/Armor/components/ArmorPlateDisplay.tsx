import { Card, Code, Flex, Text, TextField } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';
import { ModelArmor } from '../../../core/blitzkit/modelDefinitions';
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

  useEffect(() => {
    devThicknessInput.current?.focus();
  });

  if (highlightArmor === undefined) return null;

  return (
    <group position={highlightArmor.point}>
      <Html center>
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
                <TextField.Root
                  type="number"
                  style={{ width: 96 }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      devThicknessInput.current?.blur();
                      mutateTankopediaEphemeral((draft) => {
                        draft.highlightArmor = undefined;
                        const { protagonist } = duelStore.getState();
                        let armor: ModelArmor;

                        if (highlightArmor.name.startsWith('hull_')) {
                          armor = draft.model.armor;
                        } else if (highlightArmor.name.startsWith('turret_')) {
                          armor =
                            draft.model.turrets[protagonist.turret.id].armor;
                        } else if (highlightArmor.name.startsWith('gun_')) {
                          armor =
                            draft.model.turrets[protagonist.turret.id].guns[
                              protagonist.gun.id
                            ].armor;
                        } else return;

                        const index = resolveArmorIndex(highlightArmor.name);

                        if (index === undefined) return;

                        const input = event.currentTarget.valueAsNumber;

                        if (!isNaN(input)) {
                          armor.thickness[index] = input;
                        }
                      });
                    } else if (event.key === 'Escape') {
                      devThicknessInput.current?.blur();
                      mutateTankopediaEphemeral((draft) => {
                        draft.highlightArmor = undefined;
                      });
                    }
                  }}
                  key={highlightArmor.name}
                  defaultValue={highlightArmor.thickness.toFixed(0)}
                  mt="1"
                  autoFocus
                  ref={devThicknessInput}
                  size="1"
                >
                  <TextField.Slot side="right">mm</TextField.Slot>
                </TextField.Root>
              </>
            )}
          </Flex>
        </Card>
      </Html>
    </group>
  );
}
