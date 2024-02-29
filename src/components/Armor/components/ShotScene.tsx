import { Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { DoubleSide, Euler, Quaternion, Vector3 } from 'three';
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

export function ShotScene() {
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
            <mesh renderOrder={1} key={`${index}-point`} position={layer.point}>
              <icosahedronGeometry args={[1 / 16, 1]} />
              <meshBasicMaterial
                side={DoubleSide}
                color={
                  layer.status === 'penetration'
                    ? 0x00ff00
                    : layer.status === 'blocked'
                      ? 0xff0000
                      : 0xffff00
                }
              />
            </mesh>

            <group
              key={`${index}-line`}
              position={layer.point}
              rotation={shellRotation}
            >
              {shot.length > 1 && (
                <Html>
                  <Text>{layer.index + 1}</Text>
                </Html>
              )}

              {(() => {
                let length = 4;

                if (layer.index !== 0) {
                  const gap = shot[index - 1] as ShotLayerGap;
                  length = gap.distance;
                }

                return (
                  <mesh position={[0, length / 2, 0]} renderOrder={0}>
                    <cylinderGeometry args={[1 / 64, 1 / 64, length]} />
                    <meshBasicMaterial color={0xffffff} />
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
