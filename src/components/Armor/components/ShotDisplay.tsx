import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Mesh } from 'three';
import { radToDeg } from 'three/src/math/MathUtils';
import { canSplash } from '../../../core/blitz/canSplash';
import { isExplosive } from '../../../core/blitz/isExplosive';
import { NaNFallback } from '../../../core/math/NaNFallback';
import { normalToEuler } from '../../../core/math/normalToEuler';
import { AngledPenetration } from '../../../icons/AngledPenetration';
import { Block } from '../../../icons/Block';
import { NominalPenetration } from '../../../icons/NominalPenetration';
import { Ricochet } from '../../../icons/Ricochet';
import { useDuel } from '../../../stores/duel';
import {
  ShotLayer,
  ShotLayerBase,
  ShotLayerGap,
  ShotLayerNonExternal,
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../stores/tankopedia';
import { ArmorType } from './SpacedArmorScene';

const layerTypeNames: Record<ArmorType | 'null', string> = {
  [ArmorType.Core]: 'Core',
  [ArmorType.Spaced]: 'Spaced',
  [ArmorType.External]: 'External',
  null: 'Gap',
};

const LENGTH_INFINITY = 4;
const TRACER_THICK = 1 / 64;
const TRACER_THIN = TRACER_THICK / 2;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const preMidPointTracer = useRef<Mesh>(null);
  const postMidPointTracer = useRef<Mesh>(null);
  const hasMultipleLayers = shot?.layers.some(
    (layer, index) => index !== 0 && layer.type !== null,
  );
  const { shell } = useDuel.getState().antagonist!;
  const explosive = isExplosive(shell.type);
  const splashing = canSplash(shell.type);
  const midPointLayer = (shot?.layers.findLast(
    (layer) => layer.type !== null && layer.status === 'ricochet',
  ) ?? shot?.layers.findLast((layer) => layer.type !== null)) as ShotLayerBase;
  const firstLayer = shot?.layers[0] as Exclude<ShotLayer, ShotLayerGap>;
  const lastLayer = shot?.layers.at(-1)!;
  const distanceFromSpacedArmor = shot
    ? firstLayer.point.distanceTo(shot.point)
    : undefined;
  const preMidPointLayers = shot?.layers.slice(
    0,
    shot.layers.indexOf(midPointLayer as ShotLayer),
  );
  const postMidPointLayers = shot?.layers.slice(
    shot.layers.indexOf(midPointLayer as ShotLayer),
    shot.layers.length,
  );
  const preMidPointGap = shot
    ? preMidPointLayers!.reduce((accumulator, layer) => {
        if (layer.type === null) return accumulator + layer.distance;
        return accumulator;
      }, 0) + LENGTH_INFINITY
    : undefined;
  const preMidPointThickness = shot
    ? preMidPointLayers!.reduce(
        (accumulator, layer) =>
          accumulator +
          (layer.type === null
            ? 0
            : layer.type === ArmorType.External
              ? layer.thickness
              : layer.thicknessAngled),
        0,
      )
    : undefined;
  const postMidPointGap = shot
    ? postMidPointLayers!.reduce((accumulator, layer) => {
        if (layer.type === null) return accumulator + layer.distance;
        return accumulator;
      }, 0) || LENGTH_INFINITY
    : undefined;

  useFrame(({ clock }) => {
    if (!shot || !preMidPointTracer.current) return;

    const t1 = clock.elapsedTime % 1;
    const t2 = (clock.elapsedTime + 0.5) % 1;

    preMidPointTracer.current.position.set(0, (1 - t1) * preMidPointGap!, 0);
    preMidPointTracer.current.scale.set(1, 1 - 2 * Math.abs(t1 - 0.5), 1);

    if (!postMidPointTracer.current) return;

    postMidPointTracer.current.position.set(0, t2 * postMidPointGap!, 0);
    postMidPointTracer.current.scale.set(1, 1 - 2 * Math.abs(t2 - 0.5), 1);
  });

  useEffect(() => {
    function resetShot() {
      mutateTankopediaTemporary((draft) => {
        draft.shot = undefined;
      });
    }

    const unsubscribes = [
      useDuel.subscribe((state) => state.protagonist?.tank, resetShot),
      useDuel.subscribe((state) => state.antagonist?.tank, resetShot),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  });

  if (!shot) return null;

  return (
    <>
      <group
        position={midPointLayer.point}
        rotation={normalToEuler(midPointLayer.shellNormal)}
      >
        <mesh position={[0, preMidPointGap! / 2, 0]}>
          <cylinderGeometry args={[TRACER_THIN, TRACER_THIN, preMidPointGap]} />
          <meshBasicMaterial depthTest={false} />
        </mesh>

        <mesh position={[0, preMidPointGap! / 2, 0]} ref={preMidPointTracer}>
          <cylinderGeometry
            args={[TRACER_THICK, TRACER_THICK, preMidPointGap]}
          />
          <meshBasicMaterial
            color={
              lastLayer.status === 'blocked'
                ? 0xff4040
                : lastLayer.status === 'penetration'
                  ? 0x00ff00
                  : 0xffff00
            }
          />
        </mesh>
      </group>

      {midPointLayer.status === 'ricochet' && (
        <group
          position={midPointLayer.point}
          rotation={normalToEuler(
            midPointLayer.shellNormal
              .clone()
              .reflect(midPointLayer.surfaceNormal)
              .multiplyScalar(-1),
          )}
        >
          <mesh position={[0, postMidPointGap! / 2, 0]}>
            <cylinderGeometry
              args={[TRACER_THIN, TRACER_THIN, postMidPointGap]}
            />
            <meshBasicMaterial depthTest={false} />
          </mesh>

          <mesh
            position={[0, postMidPointGap! / 2, 0]}
            ref={postMidPointTracer}
          >
            <cylinderGeometry
              args={[TRACER_THICK, TRACER_THICK, postMidPointGap]}
            />
            <meshBasicMaterial color={0xffff00} />
          </mesh>
        </group>
      )}

      {shot.layers.map((layer, index) => {
        if (layer.type === null) return;

        const shellRotation = normalToEuler(layer.shellNormal);
        const nextLayer = shot.layers[index + 1] as ShotLayerGap | undefined;
        const trueStatus =
          nextLayer?.status === 'blocked' ? 'blocked' : layer.status;

        return (
          <>
            <group
              key={`${index}-line`}
              position={layer.point}
              rotation={shellRotation}
            >
              <Html
                center
                style={{
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      trueStatus === 'penetration'
                        ? '#00ff0080'
                        : trueStatus === 'blocked'
                          ? '#ff000080'
                          : '#ffff0080',
                    borderRadius: 8,
                    border: 'none',
                    padding: 4,
                    width: hasMultipleLayers ? undefined : 8,
                    height: hasMultipleLayers ? undefined : 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {hasMultipleLayers && (
                    <Text
                      size="2"
                      style={{
                        width: '100%',
                        display: 'block',
                        textAlign: 'center',
                        color: trueStatus === 'ricochet' ? 'black' : undefined,
                      }}
                    >
                      <b>{layer.index + 1}</b>
                    </Text>
                  )}
                </div>
              </Html>
            </group>
          </>
        );
      })}

      <Html
        position={midPointLayer.point}
        style={{
          transform: 'translateY(-50%)',
          marginLeft: 32,
          pointerEvents: 'none',
        }}
      >
        <Card style={{ width: 256 + 32 }}>
          <Flex direction="column">
            <Text>
              {lastLayer.status[0].toUpperCase()}
              {lastLayer.status.slice(1)}
              {lastLayer.status === 'penetration' &&
                `: ${Math.round(shell.damage.armor)}hp`}
              {lastLayer.status === 'blocked' &&
                shell.type === 'he' &&
                `: ${NaNFallback(
                  Math.max(
                    0,
                    Math.round(
                      0.5 *
                        shell.damage.armor *
                        (1 -
                          distanceFromSpacedArmor! / shell.explosionRadius!) -
                        1.1 *
                          ((midPointLayer as ShotLayerNonExternal)
                            .thicknessAngled +
                            preMidPointThickness!),
                    ),
                  ),
                  0,
                )}hp`}
            </Text>

            {shot.layers.map((layer, index) => {
              if (layer.type === null && (!explosive || splashing)) return null;

              return (
                <Flex key={index} align="center" gap="2">
                  <Flex>
                    {hasMultipleLayers && (
                      <Text size="2" style={{ width: 16 }}>
                        {layer.type === null ? null : `${layer.index + 1}.`}
                      </Text>
                    )}
                    <Text size="2">{layerTypeNames[`${layer.type}`]}</Text>
                  </Flex>

                  {layer.type !== null && (
                    <>
                      <Flex align="center" style={{ width: 64 }}>
                        <NominalPenetration width={16} height={16} />
                        <Text size="2">{Math.round(layer.thickness)}mm</Text>
                      </Flex>

                      {layer.type !== ArmorType.External && (
                        <Flex align="center">
                          {layer.status === 'ricochet' ? (
                            <Ricochet width={16} height={16} />
                          ) : layer.status === 'blocked' ? (
                            <Block width={16} height={16} />
                          ) : (
                            <AngledPenetration width={16} height={16} />
                          )}
                          <Text size="2">
                            {Math.round(layer.thicknessAngled)}mm (
                            {Math.round(radToDeg(layer.angle))}°)
                          </Text>
                        </Flex>
                      )}
                    </>
                  )}

                  {layer.type === null && (
                    <Text size="2">
                      {Math.round(layer.distance * 1000)}mm (-
                      {Math.round(Math.min(100, layer.distance * 50))}%
                      penetration)
                    </Text>
                  )}
                </Flex>
              );
            })}
          </Flex>
        </Card>
      </Html>
    </>
  );
}
