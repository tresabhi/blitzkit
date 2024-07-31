import { Card, Code, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import { radToDeg } from 'three/src/math/MathUtils';
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
              </>
            )}
          </Flex>
        </Card>
      </Html>
    </group>
  );
}
