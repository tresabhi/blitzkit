import { Card, Flex, Kbd, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ComponentProps, useRef } from 'react';
import { Euler, Mesh, Quaternion } from 'three';
import { J_HAT } from '../../../constants/axis';
import { ShotStatus, useTankopediaTemporary } from '../../../stores/tankopedia';
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

const shotStatusNames: Record<ShotStatus, string> = {
  blocked: 'Blocked',
  penetration: 'penetration',
  ricochet: 'ricochet',
  splash: 'splash',
};

const shotStatusColors: Record<
  ShotStatus,
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
  const inTracer = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!shot || !inTracer.current) return;

    const t = clock.elapsedTime % 1;
    const scale1 = -Math.abs(2 * t - 1) + 1;

    inTracer.current.scale.set(1, scale1, 1);
    inTracer.current.position.set(0, (1 - t) * inLength, 0);
  });

  if (!shot) return null;

  const inLength =
    shot.in.layers.reduce((accumulator, layer) => {
      if (layer.type === null) return accumulator + layer.distance;
      return accumulator;
    }, 0) + LENGTH_INFINITY;
  const inLast = shot.in.layers.findLast((layer) => layer.type !== null)!;

  return (
    <group>
      <Html
        position={inLast.point}
        style={{
          pointerEvents: 'none',
          transform: 'translateY(-50%)',
        }}
      >
        <Card ml="9" style={{ width: 300 }}>
          <Flex direction="column" gap="1">
            <Text color={shotStatusColors[shot.in.status]} weight="bold">
              {shot.in.status !== 'blocked' && (
                <>
                  {Math.round(shot.damage).toLocaleString()}
                  <Text size="1">hp</Text>
                </>
              )}
              {` ${shotStatusNames[shot.in.status]} `}
            </Text>

            <Flex direction="column">
              {shot.in.layers.map((layer, index) => {
                const layerName =
                  layer.type === ArmorType.External
                    ? externalLayerNames[layer.variant]
                    : layerTypeNames[`${layer.type}`];
                const layerIndex =
                  layer.type === null
                    ? null
                    : `${(shot.containsGaps ? index / 2 : index) + 1}.`;
                const shotStatusColor =
                  shot.in.status === 'splash'
                    ? shotStatusColors.splash
                    : shotStatusColors[layer.status];

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

      {shot.in.layers.map((layer, index) => {
        if (layer.type === null) return null;

        const layerIndex =
          layer.type === null
            ? null
            : (shot.containsGaps ? index / 2 : index) + 1;
        const shotStatusColor =
          shot.in.status === 'splash'
            ? shotStatusColors.splash
            : shotStatusColors[layer.status];

        return (
          <Html position={layer.point} center>
            <Kbd>
              <Text color={shotStatusColor}>{layerIndex}</Text>
            </Kbd>
          </Html>
        );
      })}

      <group
        position={inLast.point}
        rotation={new Euler().setFromQuaternion(
          new Quaternion().setFromUnitVectors(J_HAT, shot.in.cameraNormal),
        )}
      >
        <mesh position={[0, inLength / 2, 0]}>
          <cylinderGeometry
            args={[TRACER_THIN / 2, TRACER_THIN / 2, inLength]}
          />
          <meshBasicMaterial depthTest={false} />
        </mesh>

        <mesh ref={inTracer} position={[0, inLength / 2, 0]}>
          <cylinderGeometry
            args={[TRACER_THICK / 2, TRACER_THICK / 2, inLength]}
          />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </group>
  );
}
