import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { asset } from '../core/blitzkrieg/asset';

export function useModel(id: number) {
  return useLoader(GLTFLoader, asset(`3d/tanks/models/${id}.glb`));
}
