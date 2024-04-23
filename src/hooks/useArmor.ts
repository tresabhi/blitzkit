import { ObjectMap, useLoader } from '@react-three/fiber';
import { GLTF, GLTFLoader } from 'three-stdlib';
import { asset } from '../core/blitzkit/asset';

const cache: Record<number, GLTF & ObjectMap> = {};

export function useArmor(id: number) {
  const gltf = useLoader(GLTFLoader, asset(`3d/tanks/armor/${id}.glb`));
  if (!cache[id]) cache[id] = gltf;
  return cache[id];
}
