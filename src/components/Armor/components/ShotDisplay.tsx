import { Box, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { clamp } from 'lodash';
import { ComponentProps, useEffect, useRef } from 'react';
import {
  BufferGeometry,
  DoubleSide,
  Euler,
  Group,
  Line,
  LineDashedMaterial,
  Mesh,
  MeshBasicMaterial,
  Path,
  Quaternion,
} from 'three';
import { J_HAT, K_HAT } from '../../../constants/axis';
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
  const splashRadiusWrapper = useRef<Group>(null);
  const splashRadiusMaterial = useRef<MeshBasicMaterial>(null);
  let animationStartTime: number | null = null;

  useEffect(() => {
    if (shot?.splashRadius !== undefined) {
      const outlineGeometry = new BufferGeometry().setFromPoints(
        new Path().absarc(0, 0, 1, 0, Math.PI * 2).getSpacedPoints(50),
      );
      const outlineMaterial = new LineDashedMaterial({
        color: 'orange',
        dashSize: 0.05,
        gapSize: 0.025,
      });
      const outline = new Line(
        outlineGeometry,
        outlineMaterial,
      ).computeLineDistances();

      splashRadiusWrapper.current?.add(outline);

      return () => {
        splashRadiusWrapper.current?.remove(outline);
      };
    }
  });

  useEffect(() => {
    if (shot?.splashRadius !== undefined && shot.in.status === 'penetration') {
      const audio = new Audio('/assets/audio/lotta-damage.mp3');

      audio.currentTime = 0.7;
      audio.volume = 0.25;
      audio.play();
    }
  }, [shot]);

  useFrame(({ clock }) => {
    if (!shot) return;

    const t = clock.elapsedTime;

    if (inTracer.current) {
      const tracerT1 = t % 1;
      const tracerT2 = (t + 0.5) % 1;

      inTracer.current.scale.set(1, 1 - 2 * Math.abs(tracerT1 - 0.5), 1);
      inTracer.current.position.set(0, (1 - tracerT1) * inLength, 0);

      if (outTracer.current) {
        outTracer.current.scale.set(1, 1 - 2 * Math.abs(tracerT2 - 0.5), 1);
        outTracer.current.position.set(0, tracerT2 * outLength, 0);
      }
    }

    if (
      shot.splashRadius !== undefined &&
      splashRadiusWrapper.current &&
      splashRadiusMaterial.current
    ) {
      if (animationStartTime === null) animationStartTime = t;

      const scale =
        clamp(4 * (t - animationStartTime), 0, 1) * shot.splashRadius;
      const opacity = 1 - clamp(2 * (t - animationStartTime), 0, 1);

      splashRadiusWrapper.current.scale.set(scale, scale, scale);
      splashRadiusMaterial.current.opacity = opacity;
    }
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
      {shot.splashRadius && (
        <group
          position={inLast.point}
          ref={splashRadiusWrapper}
          rotation={new Euler().setFromQuaternion(
            new Quaternion().setFromUnitVectors(K_HAT, shot.in.surfaceNormal),
          )}
        >
          <mesh>
            <circleGeometry />
            <meshBasicMaterial
              side={DoubleSide}
              color="orange"
              transparent
              ref={splashRadiusMaterial}
            />
          </mesh>
        </group>
      )}

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
