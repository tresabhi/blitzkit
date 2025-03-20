import { asset } from '@blitzkit/core';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { randInt } from 'three/src/math/MathUtils.js';
import { jsxTree } from '../../../../core/blitzkit/jsxTree';

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

  console.log(gltf);

  return jsxTree(gltf.scene, {
    mesh: (mesh) => ({
      material: new MeshBasicMaterial({
        color: `rgb(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(
          0,
          255,
        )})`,
      }),
      onClick: (event) => {
        if (!(mesh.material instanceof MeshBasicMaterial)) return;
        event.stopPropagation();
        console.log(mesh.material.name)
      },
    }),
  });
}
