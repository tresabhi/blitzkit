import { Tank } from '@blitzkit/core';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ArmorGroup } from '../../../../components/ArmorGroup';

interface PageProps {
  tank: Tank;
}

export function Page({ tank }: PageProps) {
  return (
    <Canvas
      style={{
        width: 640,
        height: 640,
      }}
    >
      <OrbitControls />
      <ArmorGroup group="hull" tank={tank} />
    </Canvas>
  );
}
