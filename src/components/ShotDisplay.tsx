import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ReactNode, useEffect, useRef } from 'react';
import { Group, Mesh, Vector3 } from 'three';
import { radToDeg } from 'three/src/math/MathUtils';
import { AngledPenetration } from '../icons/AngledPenetration';
import { Block } from '../icons/Block';
import { NominalPenetration } from '../icons/NominalPenetration';
import { Ricochet } from '../icons/Ricochet';
import { Shot, useTankopediaTemporary } from '../stores/tankopedia';

export const SHOT_NAMES: Record<Shot['type'], string> = {
  ricochet: 'Ricochet',
  penetration: 'Penetration',
  block: 'Blocked',
};

export const SHOT_ICONS: Record<Shot['type'], ReactNode> = {
  ricochet: <Ricochet width={24} height={24} />,
  block: <Block width={24} height={24} />,
  penetration: <NominalPenetration width={24} height={24} />,
};

const THICKNESS = 0.025;
const LENGTH = 2;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const entryWrapper = useRef<Group>(null);
  const entryLine = useRef<Mesh>(null);
  const circle = useRef<Mesh>(null);
  const exitWrapper = useRef<Group>(null);
  const exitLine = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t1 = clock.elapsedTime % 1;
    const t2 = (clock.elapsedTime + 0.5) % 1;

    entryLine.current?.position.set(0, 0, LENGTH - t1 * LENGTH);
    entryLine.current?.scale.set(1, -2 * Math.abs(t1 - 0.5) + 1, 1);
    exitLine.current?.position.set(0, 0, t2 * LENGTH);
    exitLine.current?.scale.set(1, -2 * Math.abs(t2 - 0.5) + 1, 1);
  });

  useEffect(() => {
    if (!shot) return;

    const point = new Vector3(...shot.point);
    const shotNormal = new Vector3(...shot.shellNormal);
    const surfaceNormal = new Vector3(...shot.surfaceNormal);
    const bounceNormal = shotNormal
      .clone()
      .multiplyScalar(-1)
      .sub(
        surfaceNormal
          .clone()
          .multiplyScalar(
            2 * surfaceNormal.dot(shotNormal.clone().multiplyScalar(-1)),
          ),
      );

    entryWrapper.current?.position.set(...shot.point);
    entryWrapper.current?.lookAt(point.clone().add(shotNormal));
    exitWrapper.current?.position.set(...shot.point);
    exitWrapper.current?.lookAt(point.clone().add(bounceNormal));
    circle.current?.position.set(...shot.point);
    circle.current?.lookAt(point.clone().add(surfaceNormal));
  }, [shot]);

  if (!shot) return null;

  return (
    <>
      <mesh ref={circle}>
        <torusGeometry args={[0.05, 0.0125, 4, 16]} />
        <meshBasicMaterial
          color={shot.type === 'penetration' ? 'green' : 'red'}
          depthTest={false}
        />
      </mesh>

      <group ref={entryWrapper}>
        <Html position={[0, 0, LENGTH]}>
          <Card
            style={{
              width: 300,
            }}
          >
            <Flex direction="column" gap="1">
              <Flex align="center" gap="2">
                {SHOT_ICONS[shot.type]}
                <Text>
                  {SHOT_NAMES[shot.type]} at {Math.round(radToDeg(shot.angle))}°
                </Text>
              </Flex>

              <Flex
                direction="column"
                style={{
                  paddingLeft: 8,
                }}
              >
                {shot.thicknesses.map(({ nominal, angled, type }, index) => (
                  <Flex gap="2">
                    <Text>
                      {index + 1}. {type[0].toUpperCase()}
                      {type.slice(1)}
                    </Text>

                    <Flex gap="1">
                      <NominalPenetration width={24} height={24} />
                      <Text>{nominal}mm</Text>
                    </Flex>
                    {type !== 'external' && (
                      <Flex gap="1">
                        <AngledPenetration width={24} height={24} />
                        <Text>{Math.round(angled)}mm</Text>
                      </Flex>
                    )}
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Card>
        </Html>

        <mesh
          position={[0, 0, LENGTH / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          ref={entryLine}
        >
          <cylinderGeometry args={[THICKNESS / 2, THICKNESS / 2, LENGTH, 8]} />
          <meshBasicMaterial color="white" depthTest={false} />
        </mesh>
      </group>

      {shot.type === 'ricochet' && (
        <group ref={exitWrapper}>
          <mesh
            position={[0, 0, LENGTH / 2]}
            rotation={[Math.PI / 2, 0, 0]}
            ref={exitLine}
          >
            <cylinderGeometry
              args={[THICKNESS / 2, THICKNESS / 2, LENGTH, 8]}
            />
            <meshBasicMaterial color="white" depthTest={false} />
          </mesh>
        </group>
      )}
    </>
  );
}
