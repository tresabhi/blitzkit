import { Box, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ComponentProps, useRef } from 'react';
import { Euler, Mesh, Quaternion } from 'three';
import { J_HAT } from '../../../constants/axis';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import { ShotDisplayCard } from './ShotDisplayCard';

export const shotStatusColors: Record<
  TankopediaEphemeral.ShotStatus,
  ComponentProps<typeof Text>['color']
> = {
  blocked: 'red',
  penetration: 'green',
  ricochet: 'yellow',
  splash: 'orange',
};

const SURFACE_POINT_SIZE = 12;
export const SHOT_DISPLAY_LENGTH_INFINITY = 4;
const TRACER_THICK = 1 / 32;
const TRACER_THIN = TRACER_THICK / 2;

export function ShotDisplay() {
  const shot = TankopediaEphemeral.use((state) => state.shot);
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
    }, 0) + SHOT_DISPLAY_LENGTH_INFINITY;
  const outLength =
    shot.out && shot.out.layers.length > 0
      ? (
          shot.in.layers.at(-1) as TankopediaEphemeral.ShotLayerNonExternal
        ).point.distanceTo(
          (shot.out.layers.at(-1) as TankopediaEphemeral.ShotLayerNonExternal)
            .point,
        )
      : SHOT_DISPLAY_LENGTH_INFINITY;
  const inLast = shot.in.layers.findLast(
    (layer) => layer.type !== null,
  ) as TankopediaEphemeral.ShotLayerNonExternal;
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
        <Box
          pl="9"
          display={{
            initial: 'none',
            sm: 'block',
          }}
        >
          <ShotDisplayCard shot={shot} />
        </Box>
      </Html>

      {[...shot.in.layers, ...(shot.out?.layers ?? [])].map((layer, index) => {
        if (layer.type === null) return null;

        const shotStatusColor =
          shot.in.status === 'splash'
            ? shotStatusColors.splash
            : shotStatusColors[layer.status];

        return (
          <Html
            position={layer.point}
            key={index}
            style={{
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
            }}
          >
            <Flex
              style={{
                marginLeft: -SURFACE_POINT_SIZE / 2,
              }}
            >
              <div
                style={{
                  width: SURFACE_POINT_SIZE,
                  height: SURFACE_POINT_SIZE,
                  backgroundColor: shotStatusColor,
                  opacity: 0.75,
                  borderRadius: SURFACE_POINT_SIZE / 2,
                }}
              />
            </Flex>
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
