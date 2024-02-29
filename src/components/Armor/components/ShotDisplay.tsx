import { Card, Flex, Inset, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { Euler, Quaternion, Vector3 } from 'three';
import { radToDeg } from 'three/src/math/MathUtils';
import { J_HAT } from '../../../constants/axis';
import { isExplosive } from '../../../core/blitz/isExplosive';
import { NaNFallback } from '../../../core/math/NaNFallback';
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
  useTankopediaTemporary,
} from '../../../stores/tankopedia';
import { ArmorType } from './SpacedArmorScene';

// export const SHOT_NAMES: Record<Shot['type'], string> = {
//   ricochet: 'Ricochet',
//   penetration: 'Penetration',
//   block: 'Blocked',
// };

// export const SHOT_ICONS: Record<ShotLayerBase[''], ReactNode> = {
//   ricochet: <Ricochet width={24} height={24} />,
//   block: <Block width={24} height={24} />,
//   penetration: <NominalPenetration width={24} height={24} />,
// };

const layerTypeNames: Record<ArmorType | 'null', string> = {
  [ArmorType.Core]: 'Core',
  [ArmorType.Spaced]: 'Spaced',
  [ArmorType.External]: 'External',
  null: 'Gap',
};

// const THICKNESS = 0.05;
// const LENGTH = 4;

const LENGTH_INFINITY = 4;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const hasMultipleLayers = shot?.layers.some(
    (layer, index) => index !== 0 && layer.type !== null,
  );
  const { shell } = useDuel.getState().antagonist!;
  const explosive = isExplosive(shell.type);

  return (
    <>
      {shot?.layers.map((layer, index) => {
        if (layer.type === null) return;

        const shellRotation = new Euler().setFromQuaternion(
          new Quaternion().setFromAxisAngle(
            new Vector3().crossVectors(J_HAT, layer.shellNormal).normalize(),
            J_HAT.angleTo(layer.shellNormal),
          ),
        );
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
                <Card
                  style={{
                    backgroundColor:
                      trueStatus === 'penetration'
                        ? '#00ff00c0'
                        : trueStatus === 'blocked'
                          ? '#ff0000c0'
                          : '#ffff00c0',
                    border: 'none',
                  }}
                >
                  <Inset>
                    {hasMultipleLayers && (
                      <Text
                        style={{
                          width: '100%',
                          display: 'block',
                          textAlign: 'center',
                          color:
                            trueStatus === 'ricochet' ? 'black' : undefined,
                        }}
                      >
                        <b>{layer.index + 1}</b>
                      </Text>
                    )}
                  </Inset>
                </Card>
              </Html>

              {(() => {
                let length = LENGTH_INFINITY;

                if (layer.index !== 0) {
                  const gap = shot.layers[index - 1] as ShotLayerGap;
                  length = gap.distance;
                }

                return (
                  <mesh position={[0, length / 2, 0]}>
                    <cylinderGeometry args={[1 / 64, 1 / 64, length]} />
                    <meshBasicMaterial color={0xffffff} depthTest={false} />
                  </mesh>
                );
              })()}
            </group>

            {(() => {
              if (
                layer.status !== 'ricochet' ||
                index !== shot.layers.length - 1
              )
                return null;
              const ricochetShellNormal = layer.shellNormal
                .clone()
                .reflect(layer.surfaceNormal)
                .multiplyScalar(-1);
              const ricochetShellRotation = new Euler().setFromQuaternion(
                new Quaternion().setFromAxisAngle(
                  new Vector3()
                    .crossVectors(J_HAT, ricochetShellNormal)
                    .normalize(),
                  J_HAT.angleTo(ricochetShellNormal),
                ),
              );

              return (
                <group position={layer.point} rotation={ricochetShellRotation}>
                  <mesh position={[0, LENGTH_INFINITY / 2, 0]}>
                    <cylinderGeometry
                      args={[1 / 64, 1 / 64, LENGTH_INFINITY]}
                    />
                    <meshBasicMaterial color={0xffffff} depthTest={false} />
                  </mesh>
                </group>
              );
            })()}
          </>
        );
      })}

      {shot &&
        (() => {
          const firstLayer = shot.layers[0] as Exclude<ShotLayer, ShotLayerGap>;
          const lastLayer = shot.layers.at(-1)!;
          const midPointLayer = (shot.layers.findLast(
            (layer) => layer.type !== null && layer.status === 'ricochet',
          ) ??
            shot.layers.findLast(
              (layer) => layer.type !== null,
            )) as ShotLayerBase;
          const distanceFromSpacedArmor = firstLayer.point.distanceTo(
            shot.point,
          );

          console.log(distanceFromSpacedArmor);

          return (
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
                                distanceFromSpacedArmor /
                                  shell.explosionRadius!) -
                              1.1 *
                                (midPointLayer as ShotLayerNonExternal)
                                  .thicknessAngled,
                          ),
                        ),
                        0,
                      )}hp`}
                  </Text>

                  {shot.layers.map((layer) => {
                    if (layer.type === null && !explosive) return null;

                    return (
                      <Flex align="center" gap="2">
                        <Flex>
                          {hasMultipleLayers && (
                            <Text size="2" style={{ width: 16 }}>
                              {layer.type === null
                                ? null
                                : `${layer.index + 1}.`}
                            </Text>
                          )}
                          <Text size="2">
                            {layerTypeNames[`${layer.type}`]}
                          </Text>
                        </Flex>

                        {layer.type !== null && (
                          <>
                            <Flex align="center" style={{ width: 64 }}>
                              <NominalPenetration width={16} height={16} />
                              <Text size="2">
                                {Math.round(layer.thickness)}mm
                              </Text>
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
                            {/* why is it x50? i can't pretend to understand this shit */}
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
          );
        })()}
    </>
  );
}
