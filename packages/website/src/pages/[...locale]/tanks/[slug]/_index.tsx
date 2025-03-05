import { asset } from '@blitzkit/core';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface PageProps {
  id: string;
}

export function Page({ id }: PageProps) {
  return (
    <Canvas
      style={{
        width: 640,
        height: 640,
      }}
    >
      <OrbitControls />
      <Model id={id} />
    </Canvas>
  );
}

function Model({ id }: { id: string }) {
  const gltf = useLoader(GLTFLoader, asset(`/tanks/${id}/collision/hull.glb`));

  return <primitive object={gltf.scene} />;
}
