import { ObjectMap, useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three-stdlib';
import { asset } from '../core/blitzkit/asset';

const cache: Record<
  number,
  { gltf: GLTF & ObjectMap; hasDynamicArmor: boolean }
> = {};

export function useArmor(id: number) {
  const gltf = useLoader(GLTFLoader, asset(`3d/tanks/armor/${id}.glb`));

  console.log(Object.values(gltf.nodes).map((node) => node.name));

  if (!cache[id]) {
    cache[id] = {
      gltf,
      hasDynamicArmor: Object.values(gltf.nodes).some(
        (node) =>
          node.name.includes('state_00') || node.name.includes('state_01'),
      ),
    };
  }
  return cache[id];
}
