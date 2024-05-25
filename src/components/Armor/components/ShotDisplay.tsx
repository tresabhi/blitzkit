import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { ComponentProps } from 'react';
import { Shot, useTankopediaTemporary } from '../../../stores/tankopedia';
import { ArmorType } from './SpacedArmorScene';
import { ExternalModuleVariant } from './SpacedArmorSceneComponent';

const layerTypeNames: Record<ArmorType | 'null', string> = {
  [ArmorType.Core]: 'Core',
  [ArmorType.Spaced]: 'Spaced',
  [ArmorType.External]: 'External',
  null: 'Gap',
};

const externalLayerNames: Record<ExternalModuleVariant, string> = {
  gun: 'Gun',
  track: 'Tracks',
};

const shotStatusNames: Record<Shot['status'], string> = {
  blocked: 'Blocked',
  penetration: 'penetration',
  ricochet: 'ricochet',
  splash: 'splash',
};

const shotStatusColors: Record<
  Shot['status'],
  ComponentProps<typeof Text>['color']
> = {
  blocked: 'red',
  penetration: 'green',
  ricochet: 'yellow',
  splash: 'orange',
};

const LENGTH_INFINITY = 4;
const TRACER_THICK = 1 / 64;
const TRACER_THIN = TRACER_THICK / 2;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);

  if (!shot) return null;

  return (
    <group>
      <Html
        position={shot.point}
        style={{
          pointerEvents: 'none',
          transform: 'translateY(-50%)',
        }}
      >
        <Card ml="9" style={{ width: 300 }}>
          <Flex direction="column" gap="1">
            <Text color={shotStatusColors[shot.status]} weight="bold">
              {shot.status !== 'blocked' && (
                <>
                  {Math.round(shot.damage).toLocaleString()}
                  <Text size="1">hp</Text>
                </>
              )}
              {` ${shotStatusNames[shot.status]} `}
            </Text>

            <Flex direction="column">
              {shot.layersIn.map((layer, index) => {
                const layerName =
                  layer.type === ArmorType.External
                    ? externalLayerNames[layer.variant]
                    : layerTypeNames[`${layer.type}`];
                const layerIndex =
                  layer.type === null
                    ? null
                    : `${(shot.containsGaps ? index / 2 : index) + 1}.`;
                const shotStatusColor = shotStatusColors[layer.status];

                return (
                  <Flex align="center" gap="2">
                    <Text
                      size="1"
                      color="gray"
                      style={{
                        width: 12,
                      }}
                    >
                      {layerIndex}
                    </Text>
                    <Text
                      size="2"
                      color={shotStatusColor}
                      style={{ width: 47 }}
                    >
                      {layerName}
                    </Text>

                    {layer.type === null && (
                      <>
                        <Text
                          size="2"
                          color={shotStatusColor}
                          style={{
                            width: 64,
                          }}
                        >
                          {Math.round(layer.distance * 1000).toLocaleString()}
                          <Text size="1">mm</Text>
                        </Text>

                        <Text size="2" color="gray">
                          {Math.max(-100, Math.round(-50 * layer.distance))}%
                          penetration
                        </Text>
                      </>
                    )}

                    {layer.type === ArmorType.External && (
                      <Text
                        size="2"
                        color={shotStatusColor}
                        style={{
                          width: 64,
                        }}
                      >
                        {Math.round(layer.thickness).toLocaleString()}
                        <Text size="1">mm</Text>
                      </Text>
                    )}

                    {(layer.type === ArmorType.Core ||
                      layer.type === ArmorType.Spaced) && (
                      <>
                        <Text
                          size="2"
                          color={shotStatusColor}
                          style={{
                            width: 64,
                          }}
                        >
                          {Math.round(layer.thicknessAngled).toLocaleString()}
                          <Text size="1">mm</Text>
                        </Text>

                        <Text size="2" color="gray">
                          {Math.round(layer.thickness).toLocaleString()}
                          <Text size="1">mm</Text> nominal
                        </Text>
                      </>
                    )}
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        </Card>
      </Html>
    </group>
  );
}
