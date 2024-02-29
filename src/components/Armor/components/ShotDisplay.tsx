import { Card, Inset, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { Euler, Quaternion, Vector3 } from 'three';
import { J_HAT } from '../../../constants/axis';
import {
  ShotLayerGap,
  useTankopediaTemporary,
} from '../../../stores/tankopedia';

// export const SHOT_NAMES: Record<Shot['type'], string> = {
//   ricochet: 'Ricochet',
//   penetration: 'Penetration',
//   block: 'Blocked',
// };

// export const SHOT_ICONS: Record<Shot['type'], ReactNode> = {
//   ricochet: <Ricochet width={24} height={24} />,
//   block: <Block width={24} height={24} />,
//   penetration: <NominalPenetration width={24} height={24} />,
// };

// const THICKNESS = 0.05;
// const LENGTH = 4;

const LENGTH_INFINITY = 4;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const hasMultipleLayers = shot?.some(
    (layer, index) => index !== 0 && layer.type !== null,
  );

  console.log(shot);

  return (
    <>
      {shot?.map((layer, index) => {
        if (layer.type === null) return;

        const shellRotation = new Euler().setFromQuaternion(
          new Quaternion().setFromAxisAngle(
            new Vector3().crossVectors(J_HAT, layer.shellNormal).normalize(),
            J_HAT.angleTo(layer.shellNormal),
          ),
        );
        const nextLayer = shot[index + 1] as ShotLayerGap | undefined;
        const trueStatus =
          nextLayer?.status === 'wasted' ? 'blocked' : layer.status;

        return (
          <>
            <group
              key={`${index}-line`}
              position={layer.point}
              rotation={shellRotation}
            >
              <Html center>
                <Card
                  style={{
                    backgroundColor:
                      trueStatus === 'penetration'
                        ? '#00ff0080'
                        : trueStatus === 'blocked'
                          ? '#ff000080'
                          : '#ffff0080',
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
                        }}
                      >
                        {layer.index + 1}
                      </Text>
                    )}
                  </Inset>
                </Card>
              </Html>

              {(() => {
                let length = LENGTH_INFINITY;

                if (layer.index !== 0) {
                  const gap = shot[index - 1] as ShotLayerGap;
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
              if (layer.status !== 'ricochet' || index !== shot.length - 1)
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
    </>
  );
}
