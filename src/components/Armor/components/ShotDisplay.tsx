import { Card, Flex, Inset, Kbd, Separator, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ComponentProps, useRef } from 'react';
import { Euler, Mesh, Quaternion } from 'three';
import { radToDeg } from 'three/src/math/MathUtils';
import { J_HAT } from '../../../constants/axis';
import {
  ShotLayer,
  ShotLayerNonExternal,
  ShotStatus,
  useTankopediaTemporary,
} from '../../../stores/tankopedia';
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
  ricochet: 'Ricochet',
  penetration: 'penetration',
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
const TRACER_THICK = 1 / 32;
const TRACER_THIN = TRACER_THICK / 2;

function LayerEntry({
  layerIndex,
  shotStatusColor,
  layerName,
  layer,
  angle,
}: {
  layerIndex?: string;
  shotStatusColor: ComponentProps<typeof Text>['color'];
  layerName: string;
  layer: ShotLayer;
  angle?: number;
}) {
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
      <Text size="2" color={shotStatusColor} style={{ width: 47 }}>
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
            {Math.max(-100, Math.round(-50 * layer.distance))}% penetration
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

      {(layer.type === ArmorType.Core || layer.type === ArmorType.Spaced) && (
        <>
          <Text
            size="2"
            color={shotStatusColor}
            style={{
              width: 80,
            }}
          >
            {Math.round(layer.thicknessAngled).toLocaleString()}
            <Text size="1">{`mm${angle === undefined ? '' : ` ${Math.round(radToDeg(angle))}°`}`}</Text>
          </Text>

          <Text size="2" color="gray">
            {Math.round(layer.thickness).toLocaleString()}
            <Text size="1">mm</Text> nominal
          </Text>
        </>
      )}
    </Flex>
  );
}

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const inTracer = useRef<Mesh>(null);
  const outTracer = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!shot || !inTracer.current) return;

    const t1 = clock.elapsedTime % 1;
    const t2 = (clock.elapsedTime + 0.5) % 1;

    inTracer.current.scale.set(1, 1 - 2 * Math.abs(t1 - 0.5), 1);
    inTracer.current.position.set(0, (1 - t1) * inLength, 0);

    if (!outTracer.current) return;

    outTracer.current.scale.set(1, 1 - 2 * Math.abs(t2 - 0.5), 1);
    outTracer.current.position.set(0, t2 * outLength, 0);
  });

  if (!shot) return null;

  const inLength =
    shot.in.layers.reduce((accumulator, layer) => {
      if (layer.type === null) return accumulator + layer.distance;
      return accumulator;
    }, 0) + LENGTH_INFINITY;
  const outLength =
    shot.out && shot.out.layers.length > 0
      ? (shot.in.layers.at(-1) as ShotLayerNonExternal).point.distanceTo(
          (shot.out.layers.at(-1) as ShotLayerNonExternal).point,
        )
      : LENGTH_INFINITY;
  const inLast = shot.in.layers.findLast(
    (layer) => layer.type !== null,
  ) as ShotLayerNonExternal;
  const outTitleColor = shot.out
    ? shotStatusColors[shot.out.status]
    : undefined;
  const inTitleColor = shotStatusColors[shot.in.status];

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
          <Flex direction="column" gap="2">
            <Flex direction="column" gap="1">
              <Text color={inTitleColor} weight="bold">
                {shot.in.status !== 'blocked' &&
                  shot.in.status !== 'ricochet' && (
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
                      ? undefined
                      : `${(shot.containsGaps ? index / 2 : index) + 1}.`;
                  const shotStatusColor =
                    shot.in.status === 'splash'
                      ? shotStatusColors.splash
                      : shotStatusColors[layer.status];

                  return (
                    <LayerEntry
                      key={index}
                      layer={layer}
                      layerIndex={layerIndex}
                      layerName={layerName}
                      shotStatusColor={shotStatusColor}
                      angle={
                        layer.type === ArmorType.Core ||
                        layer.type === ArmorType.Spaced
                          ? layer.angle
                          : undefined
                      }
                    />
                  );
                })}
              </Flex>
            </Flex>

            {shot.out && shot.out.layers.length > 0 && (
              <>
                <Inset side="x">
                  <Flex align="center" gap="2">
                    <Separator
                      style={{
                        flex: 1,
                      }}
                    />
                    <Text size="1" color="gray">
                      ricochet (-25% penetration)
                    </Text>
                    <Separator
                      style={{
                        flex: 1,
                      }}
                    />
                  </Flex>
                </Inset>

                <Text color={outTitleColor} weight="bold">
                  {shot.out.status !== 'blocked' &&
                    shot.out.status !== 'ricochet' && (
                      <>
                        {Math.round(shot.damage).toLocaleString()}
                        <Text size="1">hp</Text>
                      </>
                    )}
                  {` ${shotStatusNames[shot.out.status]} `}
                </Text>

                <Flex direction="column">
                  {shot.out.layers.map((layer, index) => {
                    const layerName =
                      layer.type === ArmorType.External
                        ? externalLayerNames[layer.variant]
                        : layerTypeNames[`${layer.type}`];
                    const shiftedIndex = index + shot.out!.layers.length;
                    const layerIndex =
                      layer.type === null
                        ? undefined
                        : `${(shot.containsGaps ? shiftedIndex / 2 : shiftedIndex) + 1}.`;
                    const shotStatusColor =
                      shot.out!.status === 'splash'
                        ? shotStatusColors.splash
                        : shotStatusColors[layer.status];

                    return (
                      <LayerEntry
                        key={index}
                        layer={layer}
                        layerIndex={layerIndex}
                        layerName={layerName}
                        shotStatusColor={shotStatusColor}
                        angle={
                          layer.type === ArmorType.Core ||
                          layer.type === ArmorType.Spaced
                            ? layer.angle
                            : undefined
                        }
                      />
                    );
                  })}
                </Flex>
              </>
            )}
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
          <Html
            key={index}
            position={layer.point}
            center
            style={{
              pointerEvents: 'none',
            }}
          >
            <Kbd>
              <Text color={shotStatusColor}>{layerIndex}</Text>
            </Kbd>
          </Html>
        );
      })}

      <group
        position={inLast.point}
        rotation={new Euler().setFromQuaternion(
          new Quaternion().setFromUnitVectors(J_HAT, shot.in.surfaceNormal),
        )}
      >
        <mesh position={[0, inLength / 2, 0]} renderOrder={2}>
          <cylinderGeometry
            args={[TRACER_THIN / 2, TRACER_THIN / 2, inLength]}
          />
          <meshBasicMaterial depthTest={false} transparent />
        </mesh>

        <mesh ref={inTracer} position={[0, inLength / 2, 0]} renderOrder={3}>
          <cylinderGeometry
            args={[TRACER_THICK / 2, TRACER_THICK / 2, inLength]}
          />
          <meshBasicMaterial
            color={inTitleColor}
            depthTest={false}
            transparent
          />
        </mesh>
      </group>

      {shot.out && (
        <group
          position={inLast.point}
          rotation={new Euler().setFromQuaternion(
            new Quaternion().setFromUnitVectors(
              J_HAT,
              shot.out.surfaceNormal.clone(),
            ),
          )}
        >
          <mesh position={[0, outLength / 2, 0]} renderOrder={2}>
            <cylinderGeometry
              args={[TRACER_THIN / 2, TRACER_THIN / 2, outLength]}
            />
            <meshBasicMaterial depthTest={false} transparent />
          </mesh>

          <mesh
            ref={outTracer}
            position={[0, outLength / 2, 0]}
            renderOrder={3}
          >
            <cylinderGeometry
              args={[TRACER_THICK / 2, TRACER_THICK / 2, outLength]}
            />
            <meshBasicMaterial
              color={outTitleColor}
              depthTest={false}
              transparent
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
