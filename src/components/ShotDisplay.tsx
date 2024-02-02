import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { ReactNode, useEffect, useRef } from 'react';
import { Group, Vector3 } from 'three';
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

const THICKNESS = 0.05;
const LENGTH = 2;

export function ShotDisplay() {
  const shot = useTankopediaTemporary((state) => state.shot);
  const wrapper = useRef<Group>(null);

  useEffect(() => {
    if (!shot) return;

    const point = new Vector3(...shot.point);
    const shotNormal = new Vector3(...shot.shellNormal);

    wrapper.current?.position.set(...shot.point);
    wrapper.current?.lookAt(point.clone().add(shotNormal));
  }, [shot]);

  if (!shot) return null;

  return (
    <group ref={wrapper}>
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

      <mesh position={[0, 0, LENGTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[THICKNESS / 2, THICKNESS / 2, LENGTH, 8]} />
        <meshBasicMaterial color="white" depthTest={false} />
      </mesh>
    </group>
  );
}
