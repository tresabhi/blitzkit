import { asset, J_HAT } from '@blitzkit/core';
import {
  blueDark,
  crimsonDark,
  indigoDark,
  mauveDark,
  orangeDark,
  plumDark,
  purpleDark,
  slateDark,
  tomatoDark,
  yellowDark,
} from '@radix-ui/colors';
import {
  Base,
  Geometry,
  Subtraction,
  type CSGGeometryRef,
} from '@react-three/csg';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Fragment, useEffect, useRef } from 'react';
import type { Mesh } from 'three';
import {
  Box3,
  Color,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineSegments,
  Material,
  MeshStandardMaterial,
  Plane,
  Vector3,
} from 'three';
import {
  dissectEvent,
  lastDissection,
  type DissectEventData,
} from '../../../core/blitzkit/dissect';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import {
  lastModuleSelect,
  moduleSelectEvent,
  type ModuleSelectEventData,
} from '../../../core/blitzkit/moduleSelect';
import { Duel } from '../../../stores/duel';
import { TankopediaEphemeral } from '../../../stores/tankopediaEphemeral';
import { groupNameRegex } from './StaticArmorSceneComponent';

interface DissectorSceneComponentProps {
  group: string;
}

const NEGATIVE_SIZE = 20;

const armorColor = new Color().multiplyScalar(2 ** -4);
const armorOutlineColor = armorColor.clone().multiplyScalar(2 ** 4.5);

const moduleColor: Record<string, Color> = {
  Armor: armorColor,
  ArmorScreen: armorColor,

  Commander: new Color(mauveDark.mauve11),
  Driver: new Color(mauveDark.mauve11),
  Gunner1: new Color(mauveDark.mauve11),
  Loader1: new Color(mauveDark.mauve11),

  SurveyingDevice: new Color(plumDark.plum7),
  Radio: new Color(slateDark.slate7),
  Gun: new Color(blueDark.blue8),
  FuelTank: new Color(orangeDark.orange9),
  Engine: new Color(crimsonDark.crimson8),
  AmmoBay: new Color(yellowDark.yellow9),
  LeftTrack: new Color(purpleDark.purple5),
  RightTrack: new Color(purpleDark.purple5),
  TurretRotator: new Color(indigoDark.indigo7),
  Transmission: new Color(tomatoDark.tomato4),
};
const moduleOutlineColor: Record<string, Color> = {
  Armor: armorOutlineColor,
  ArmorScreen: armorOutlineColor,
};

for (const key in moduleColor) {
  if (key in moduleOutlineColor) continue;
  moduleOutlineColor[key] = moduleColor[key].clone().multiplyScalar(0.5);
}

export function DissectorSceneComponent({
  group,
}: DissectorSceneComponentProps) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const gltf = useGLTF(asset(`tanks/${tank.id}/collision/${group}.glb`));
  const armor = TankopediaEphemeral.use((state) => state.armor);
  const groupName = group.match(groupNameRegex)![1];
  const groupArmor = armor.groups[groupName];
  const camera = useThree((state) => state.camera);

  return jsxTree(gltf.scene, {
    mesh(mesh, props) {
      const csg = useRef<CSGGeometryRef>(null);
      const subtractionWrapper = useRef<Group>(null);
      const baseWrapper = useRef<Mesh>(null);

      if (!(mesh.material instanceof Material)) {
        return null;
      }

      const armorName = mesh.material.name;
      const armorPlate = groupArmor.armors[armorName];
      const isModule =
        armorPlate.type !== 'Armor' && armorPlate.type !== 'ArmorScreen';
      const isTrack =
        armorPlate.type === 'LeftTrack' || armorPlate.type === 'RightTrack';

      if (!(armorPlate.type in moduleColor)) {
        throw new TypeError(`Unhandled armor type: ${armorPlate.type}`);
      }

      const clippingPlane = useRef(new Plane());
      const clippingPlaneInverse = useRef(new Plane());
      const material = useRef(
        new MeshStandardMaterial({
          transparent: isTrack,
          opacity: 2 ** -5,
          side: DoubleSide,
          color: moduleColor[armorPlate.type],
          clippingPlanes: isModule ? [] : [clippingPlane.current],
        }),
      );
      const outline = useRef<LineSegments>(null);
      const outlineMaterial = useRef(
        new LineBasicMaterial({
          transparent: !isModule,
          opacity: 2 ** -3,
          side: DoubleSide,
          color: moduleOutlineColor[armorPlate.type],
          clippingPlanes: [clippingPlane.current],
        }),
      );
      const outlineMaterialInverse = useRef(
        new LineBasicMaterial({
          transparent: !isModule,
          opacity: 2 ** -6,
          side: DoubleSide,
          color: moduleOutlineColor[armorPlate.type],
          clippingPlanes: isModule ? [] : [clippingPlaneInverse.current],
        }),
      );
      const worldPosition = new Vector3();
      const boundsTop = new Vector3();
      const bounds = new Box3();

      useEffect(() => {
        const offset = new Vector3();

        function handleDissectEvent(event: DissectEventData) {
          clippingPlane.current.normal
            .set(0, 0, 1)
            .applyAxisAngle(J_HAT, event.rotation - Math.PI / 2);
          clippingPlane.current.constant = event.offset;
          clippingPlaneInverse.current.copy(clippingPlane.current).negate();

          if (
            !subtractionWrapper.current ||
            !csg.current ||
            !baseWrapper.current
          )
            return;

          baseWrapper.current.getWorldPosition(worldPosition);
          offset.set(-event.offset, 0, 0).applyAxisAngle(J_HAT, event.rotation);
          subtractionWrapper.current.position
            .copy(worldPosition)
            .add(offset)
            .multiplyScalar(-1);
          subtractionWrapper.current.rotation.y = event.rotation;
          csg.current.update();
        }

        function handleModuleSelectEvent(event: ModuleSelectEventData) {
          if (!isModule) return;

          const isThisComponentSelected =
            event.selected &&
            event.group === groupName &&
            event.module === armorName;
          const shouldBeVisible = !event.selected || isThisComponentSelected;

          material.current.transparent = !shouldBeVisible;
          outlineMaterial.current.transparent = !shouldBeVisible;
        }

        dissectEvent.on(handleDissectEvent);
        moduleSelectEvent.on(handleModuleSelectEvent);

        handleDissectEvent(lastDissection);
        handleModuleSelectEvent(lastModuleSelect);

        return () => {
          dissectEvent.off(handleDissectEvent);
          moduleSelectEvent.off(handleModuleSelectEvent);
        };
      }, []);

      return (
        <Fragment key={props.key}>
          <lineSegments ref={outline} material={outlineMaterial.current}>
            <edgesGeometry args={[props.geometry, 45]} />
          </lineSegments>

          {isModule && (
            <>
              <mesh
                material={material.current}
                ref={baseWrapper}
                onClick={(event) => {
                  if (!baseWrapper.current) return;

                  const isAlreadySelected =
                    lastModuleSelect.selected &&
                    lastModuleSelect.group === groupName &&
                    lastModuleSelect.module === armorName;

                  if (!isAlreadySelected) {
                    moduleSelectEvent.emit({
                      selected: true,
                      group: groupName,
                      module: armorName,
                      position: event.point.toArray(),
                    });
                  }
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
              >
                <Geometry ref={csg}>
                  <Base geometry={props.geometry} />

                  <group rotation={[0, 0, 0]} ref={subtractionWrapper}>
                    <Subtraction position={[NEGATIVE_SIZE / 2, 0, 0]}>
                      <boxGeometry
                        args={[NEGATIVE_SIZE, NEGATIVE_SIZE, NEGATIVE_SIZE]}
                      />
                    </Subtraction>
                  </group>
                </Geometry>
              </mesh>
            </>
          )}

          {!isModule && (
            <lineSegments material={outlineMaterialInverse.current}>
              <edgesGeometry args={[props.geometry, 45]} />
            </lineSegments>
          )}
        </Fragment>
      );
    },
  });
}
