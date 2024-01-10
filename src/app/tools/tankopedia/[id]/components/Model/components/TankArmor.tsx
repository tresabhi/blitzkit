import { useLoader } from '@react-three/fiber';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three-stdlib';
import { X_AXIS } from '../../../../../../../constants/axis';
import { asset } from '../../../../../../../core/blitzkrieg/asset';
import {
  ModelDefinitions,
  modelDefinitions,
} from '../../../../../../../core/blitzkrieg/modelDefinitions';
import { useTankopedia } from '../../../../../../../stores/tankopedia';

export const TankArmor = forwardRef<Group>((_props, ref) => {
  const hullContainer = useRef<Group>(null);
  const protagonist = useTankopedia((state) => {
    if (!state.areTanksAssigned) return;
    return state.protagonist;
  });
  const [awaitedModelDefinitions, setAwaitedModelDefinitions] = useState<
    ModelDefinitions | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      setAwaitedModelDefinitions(await modelDefinitions);
    })();
  }, []);

  useImperativeHandle(ref, () => hullContainer.current!);

  if (!awaitedModelDefinitions) return null;
  if (!protagonist) return null;

  const tankModelDefinition = awaitedModelDefinitions[protagonist.tank.id];
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const turretOrigin = new Vector3(
    tankModelDefinition.turretOrigin[0],
    tankModelDefinition.turretOrigin[1],
    -tankModelDefinition.turretOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunOrigin = new Vector3(
    turretModelDefinition.gunOrigin[0],
    turretModelDefinition.gunOrigin[1],
    -turretModelDefinition.gunOrigin[2],
  ).applyAxisAngle(X_AXIS, Math.PI / 2);
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const gltf = useLoader(
    GLTFLoader,
    asset(`3d/tanks/armor/${protagonist.tank.id}.glb`),
  );

  return (
    <group ref={hullContainer} rotation={[-Math.PI / 2, 0, 0]}>
      {Object.values(gltf.nodes).map((node) => {
        const armor = Number(node.name.match(/.+_armor_(\d+)/)?.[1]);
        const position = new Vector3();

        if (node.name.startsWith('turret_')) position.add(turretOrigin);
        if (node.name.startsWith('gun_'))
          position.add(turretOrigin).add(gunOrigin);

        return (
          <mesh
            key={node.uuid}
            geometry={(node as Mesh).geometry}
            position={position}
          >
            <meshBasicMaterial color="red" transparent opacity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
});
