import { useThree } from '@react-three/fiber';
import { clamp } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
  Box3,
  Color,
  DoubleSide,
  FrontSide,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Plane,
  Quaternion,
} from 'three';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import { discardClippingPlane } from '../../../core/three/discardClippingPlane';
import * as TankopediaEphemeral from '../../../stores/tankopediaEphemeral';
import { ThicknessRange } from '../../StaticArmor';
import { ArmorType } from './SpacedArmorScene';
import {
  ArmorUserData,
  ExternalModuleVariant,
} from './SpacedArmorSceneComponent';

type StaticArmorSceneComponentProps = {
  name: string;
  clip?: Plane;
  thickness: number;
  thicknessRange: ThicknessRange;
  node: Object3D;
} & (
  | {
      type: Exclude<ArmorType, ArmorType.External>;
    }
  | {
      type: ArmorType.External;
      variant: ExternalModuleVariant;
    }
);

const unselectedColor = new Color(0x404040);
const externalModuleColor = new Color(0, 1 / 4, 1 / 2);

export function StaticArmorSceneComponent({
  name,
  thickness,
  thicknessRange,
  node,
  clip,
  ...props
}: StaticArmorSceneComponentProps) {
  const mutateTankopediaEphemeralStore = TankopediaEphemeral.useMutation();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera);

  const x = thickness / thicknessRange.value;
  const xClamped = clamp(x, 0, 1);
  let color: Color;
  let opacity: number;
  let depthWrite = true;

  switch (props.type) {
    case ArmorType.Primary:
      if (x > 1) {
        color = new Color(clamp(2 - x, 0.5, 1), 0, 0);
      } else {
        color = new Color(-((1 - x) ** 2) + 1, -(x ** 2) + 1, 0);
      }
      opacity = 1;
      break;

    case ArmorType.Spaced:
      color = new Color(
        clamp(1 - (7 / 8) * xClamped, 0, 1),
        0,
        clamp(1 - (1 / 8) * xClamped, 0, 1),
      );
      opacity = clamp(x + 1 / 2, 0, 1);
      break;

    case ArmorType.External:
      color = externalModuleColor;
      opacity = 1 / 8;
      depthWrite = false;
      break;
  }

  opacity = clamp(opacity, 0, 1);

  const surfaceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        opacity,
        transparent: opacity < 1,
        depthWrite,
        ...(clip ? { clippingPlanes: [clip] } : {}),
      }),
    [thickness],
  );

  const outlineMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: color
          .clone()
          .multiplyScalar(props.type === ArmorType.Spaced ? 2 ** 2 : 2 ** -1),
      }),
    [thickness],
  );

  /**
   * hook inside an if statement?? don't panic! I assure you the static prop
   * never mutates :)
   */
  useEffect(() => {
    function handleHighlightArmor(selectedName?: string) {
      if (selectedName === undefined) {
        // nothing selected, go back to defaults
        surfaceMaterial.opacity = opacity;
        surfaceMaterial.transparent = opacity < 1;
        surfaceMaterial.color = color;
        surfaceMaterial.depthWrite = props.type !== ArmorType.External;
        surfaceMaterial.side = FrontSide;
        outlineMaterial.visible = true;
      } else if (
        selectedName === name ||
        (name.startsWith('chassis_') && selectedName.startsWith('chassis_')) ||
        (name.startsWith('gun_') &&
          selectedName.startsWith('gun_') &&
          !name.includes('_armor_') &&
          !selectedName.includes('_armor_'))
      ) {
        // this selected, stand out!
        surfaceMaterial.opacity = 1;
        surfaceMaterial.transparent = false;
        surfaceMaterial.color = color;
        surfaceMaterial.depthWrite = true;
        surfaceMaterial.side = DoubleSide;
        outlineMaterial.visible = true;
      } else {
        // something else selected, become background
        surfaceMaterial.opacity = 1 / 4;
        surfaceMaterial.transparent = true;
        surfaceMaterial.color = unselectedColor;
        surfaceMaterial.depthWrite = props.type !== ArmorType.External;
        surfaceMaterial.side = FrontSide;
        outlineMaterial.visible = false;
      }

      surfaceMaterial.needsUpdate = true;
    }

    const unsubscribe = tankopediaEphemeralStore.subscribe(
      (state) => state.highlightArmor?.name,
      handleHighlightArmor,
    );

    return unsubscribe;
  }, [thickness]);

  return (
    <>
      {jsxTree(node, {
        material: surfaceMaterial,
        userData: {
          type: props.type,
          variant: props.type === ArmorType.External ? props.variant : 'gun',
          thickness,
        } satisfies ArmorUserData,

        onClick(event) {
          if (discardClippingPlane(event.object, event.point)) return;

          event.stopPropagation();

          const { editStatic } = tankopediaEphemeralStore.getState();

          const bounds = new Box3().setFromObject(event.object);
          const point = bounds.min
            .clone()
            .add(bounds.max)
            .divideScalar(2)
            .setY(bounds.max.y);
          const cameraNormal = camera.position.clone().sub(point).normalize();
          const surfaceNormal = event
            .normal!.clone()
            .applyQuaternion(event.object.getWorldQuaternion(new Quaternion()));
          const angle = surfaceNormal.angleTo(cameraNormal);
          const thicknessAngled = thickness / Math.sin(Math.PI / 2 - angle);

          mutateTankopediaEphemeralStore((draft) => {
            draft.highlightArmor = {
              type: props.type,
              name,
              point,
              thickness,
              thicknessAngled,
              angle,
              color: `#${color.getHexString()}`,
              editingPlate: editStatic,
            };
          });
        },
      })}

      {node instanceof Mesh && (
        <lineSegments material={outlineMaterial}>
          <edgesGeometry args={[node.geometry, 45]} />
        </lineSegments>
      )}
    </>
  );
}
