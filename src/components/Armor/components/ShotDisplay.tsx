import { Text } from '@radix-ui/themes';
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

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);

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

        return (
          <>
            <group
              key={`${index}-line`}
              position={layer.point}
              rotation={shellRotation}
            >
              {shot.length > 1 && (
                <Html center>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '100%',
                      position: 'relative',
                      backgroundColor:
                        layer.status === 'penetration'
                          ? '#00ff00'
                          : layer.status === 'blocked'
                            ? '#ff0000'
                            : '#ffff00',
                    }}
                  >
                    <Text
                      style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginLeft: 8,
                      }}
                    >
                      {layer.index + 1}
                    </Text>
                  </div>
                </Html>
              )}

              {(() => {
                let length = 4;

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
          </>
        );
      })}
    </>
  );
}
