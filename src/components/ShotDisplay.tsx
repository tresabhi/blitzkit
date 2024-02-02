import { Card, Flex, Text } from '@radix-ui/themes';
import { Html } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { SHOT_NAMES, useTankopediaTemporary } from '../stores/tankopedia';

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
        <Card>
          <Flex direction="column">
            <Text>{SHOT_NAMES[shot.type]}</Text>
          </Flex>
        </Card>
      </Html>

      <mesh position={[0, 0, LENGTH / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[THICKNESS / 2, THICKNESS / 2, LENGTH, 8]} />
        {/* <boxGeometry args={[THICKNESS, THICKNESS, LENGTH]} /> */}
        <meshBasicMaterial color="white" depthTest={false} />
      </mesh>
    </group>
  );
}
