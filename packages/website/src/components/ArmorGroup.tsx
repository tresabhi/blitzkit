import { asset, TankArmor, type Tank } from '@blitzkit/core';
import { useLoader } from '@react-three/fiber';
import { Material, MeshBasicMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { randInt } from 'three/src/math/MathUtils.js';
import { jsxTree } from '../core/blitzkit/jsxTree';

interface ArmorGroupProps {
  tank: Tank;
  armor: TankArmor;
  group: string;
}

export function ArmorGroup({ tank, armor, group }: ArmorGroupProps) {
  const gltf = useLoader(
    GLTFLoader,
    asset(`/tanks/${tank.id}/collision/hull.glb`),
  );

  return jsxTree(gltf.scene, {
    mesh: (mesh) => {
      return {
        material: new MeshBasicMaterial({
          color: `rgb(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(
            0,
            255,
          )})`,
        }),
        onClick: (event) => {
          if (!(mesh.material instanceof Material)) return;

          event.stopPropagation();

          const armorName = mesh.material.name;
          const penetrationGroup = armor.groups[group];
          const thickness = penetrationGroup.armors[armorName];

          console.log(tank.id, armorName, penetrationGroup, thickness);
        },
      };
    },
  });
}
