import {
  invalidate,
  useThree,
  type ObjectMap,
  type ThreeEvent,
} from "@react-three/fiber";
import { useRef, type ComponentProps } from "react";
import type { Texture } from "three";
import {
  BatchedMesh,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
} from "three";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { hasEquipment } from "../core/blitzkit/hasEquipment";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";
import { controlsEnabledEvent } from "../core/controlsEnabled";
import { useModel } from "../hooks/useModel";
import { useTankModelDefinition } from "../hooks/useTankModelDefinition";
import { useTankTransform } from "../hooks/useTankTransform";
import { Duel } from "../stores/duel";
import { Tankopedia } from "../stores/tankopedia";
import { TankopediaDisplay } from "../stores/tankopediaPersistent/constants";
import { ModelTankWrapper } from "./Armor/components/ModelTankWrapper";

interface BatchedProps extends ComponentProps<"group"> {
  slicer: (node: Object3D) => boolean;
  mutator?: (mesh: Mesh) => void;
}

function useBatched(map: ObjectMap, shadows = false) {
  return function Batched({ slicer, mutator, ...props }: BatchedProps) {
    const groups = new Map<
      MeshStandardMaterial,
      { clonedMaterial: MeshStandardMaterial; meshes: Mesh[] }
    >();

    for (const node of Object.values(map.nodes)) {
      if (!slicer(node)) continue;

      node.traverse((object) => {
        if (!(object instanceof Mesh)) return;

        const originalMaterial = object.material;

        if (!(originalMaterial instanceof MeshStandardMaterial)) return;

        let group = groups.get(originalMaterial);

        if (!group) {
          group = {
            clonedMaterial: originalMaterial.clone(),
            meshes: [],
          };
          groups.set(originalMaterial, group);
        }

        group.meshes.push(object);
      });
    }

    const wrapper = new Group();

    for (const { clonedMaterial: material, meshes } of groups.values()) {
      let vertices = 0;
      let indices = 0;

      for (const mesh of meshes) {
        vertices += mesh.geometry.attributes.position.count;
        indices += mesh.geometry.index!.count;
      }

      const batched = new BatchedMesh(
        meshes.length,
        vertices,
        indices,
        material,
      );

      for (const mesh of meshes) {
        const geometryId = batched.addGeometry(mesh.geometry);
        const instanceId = batched.addInstance(geometryId);

        mesh.updateWorldMatrix(true, false);
        batched.setMatrixAt(instanceId, mesh.matrixWorld);

        if (shadows) {
          batched.castShadow = true;
          batched.receiveShadow = true;
        }

        mutator?.(mesh);
      }

      wrapper.add(batched);
    }

    return (
      <group {...props}>
        <primitive object={wrapper} />
      </group>
    );
  };
}

interface SectionProps {
  map: ObjectMap;
}

function Tracks({ map }: SectionProps) {
  const Batched = useBatched(map, true);

  const position = useRef(new Vector2());
  const delta = useRef(new Vector2());

  const textures = useRef(new Set<Texture | null>());

  function handlePointerMove(event: PointerEvent) {
    delta.current.set(event.clientX, event.clientY).sub(position.current);
    position.current.set(event.clientX, event.clientY);

    const deltaX = delta.current.x / window.innerWidth;
    const deltaY = delta.current.y / window.innerHeight;

    const offset = deltaX + deltaY;

    for (const texture of textures.current) {
      if (!texture) continue;
      texture.offset.y += offset;
    }

    invalidate();
  }
  function handlePointerUp() {
    controlsEnabledEvent.dispatch(true);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }
  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    if (Tankopedia.state.display !== TankopediaDisplay.Model) {
      return;
    }

    const material = (event.object as Mesh).material as MeshStandardMaterial;

    textures.current = new Set([
      material.map,
      material.aoMap,
      material.normalMap,
      material.roughnessMap,
      material.metalnessMap,
    ]);

    position.current.set(event.clientX, event.clientY);
    event.stopPropagation();

    controlsEnabledEvent.dispatch(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <Batched
      onPointerDown={handlePointerDown}
      slicer={(node) => {
        return node.name.startsWith("chassis_track_");
      }}
    />
  );
}

function Hull({ map }: SectionProps) {
  const Batched = useBatched(map, true);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
  }

  return (
    <Batched
      onPointerDown={handlePointerDown}
      slicer={(node) => {
        const isHull = node.name === "hull";
        const isWheel = node.name.startsWith("chassis_wheel_");

        return isHull || isWheel;
      }}
    />
  );
}

function Turret({ map }: SectionProps) {
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];

  const Batched = useBatched(map, true);

  const position = useRef(new Vector2());
  const delta = useRef(new Vector2());

  const canvas = useThree((state) => state.gl.domElement);

  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();

    position.current.set(event.clientX, event.clientY);

    controlsEnabledEvent.dispatch(false);
    Tankopedia.mutate((draft) => {
      draft.shot = undefined;
      draft.highlightArmor = undefined;
    });
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    const hasImprovedVerticalStabilizer = hasEquipment(
      122,
      Duel.state.protagonist.tank.equipment_preset,
      Duel.state.protagonist.equipmentMatrix,
    );
    const hasDownImprovedVerticalStabilizer = hasEquipment(
      124,
      Duel.state.protagonist.tank.equipment_preset,
      Duel.state.protagonist.equipmentMatrix,
    );
    const boundingRect = canvas.getBoundingClientRect();

    delta.current.set(event.clientX, event.clientY).sub(position.current);
    position.current.set(event.clientX, event.clientY);

    const [pitch, yaw] = applyPitchYawLimits(
      modelTransformEvent.last!.pitch,
      modelTransformEvent.last!.yaw +
        delta.current.x * (Math.PI / boundingRect.width),
      gunModelDefinition.pitch!,
      turretModelDefinition.yaw,
      hasImprovedVerticalStabilizer,
      hasDownImprovedVerticalStabilizer,
    );
    modelTransformEvent.dispatch({ pitch, yaw });
  }
  function handlePointerUp() {
    controlsEnabledEvent.dispatch(true);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  return (
    <Batched
      onPointerDown={onPointerDown}
      slicer={(node) => {
        const isCurrentTurret =
          node.name ===
          `turret_${turretModelDefinition.model_id
            .toString()
            .padStart(2, "0")}`;

        return isCurrentTurret;
      }}
    />
  );
}

function Gun({ map }: SectionProps) {
  const Batched = useBatched(map, true);

  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];

  const position = useRef(new Vector2());
  const delta = useRef(new Vector2());
  const pitch = useRef(0);
  const yaw = useRef(0);

  const canvas = useThree((state) => state.gl.domElement);

  function handlePointerMove(event: PointerEvent) {
    const hasImprovedVerticalStabilizer = hasEquipment(
      122,
      Duel.state.protagonist.tank.equipment_preset,
      Duel.state.protagonist.equipmentMatrix,
    );
    const hasDownImprovedVerticalStabilizer = hasEquipment(
      124,
      Duel.state.protagonist.tank.equipment_preset,
      Duel.state.protagonist.equipmentMatrix,
    );
    const boundingRect = canvas.getBoundingClientRect();
    delta.current.set(event.clientX, event.clientY).sub(position.current);
    position.current.set(event.clientX, event.clientY);

    [pitch.current, yaw.current] = applyPitchYawLimits(
      pitch.current - delta.current.y * (Math.PI / boundingRect.height),
      yaw.current + delta.current.x * (Math.PI / boundingRect.width),
      gunModelDefinition.pitch!,
      turretModelDefinition.yaw,
      hasImprovedVerticalStabilizer,
      hasDownImprovedVerticalStabilizer,
    );
    modelTransformEvent.dispatch({ pitch: pitch.current, yaw: yaw.current });
  }
  function handlePointerUp() {
    controlsEnabledEvent.dispatch(true);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }
  function onPointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();

    controlsEnabledEvent.dispatch(false);
    Tankopedia.mutate((draft) => {
      draft.shot = undefined;
      draft.highlightArmor = undefined;
    });

    position.current.set(event.clientX, event.clientY);
    pitch.current = modelTransformEvent.last!.pitch;
    yaw.current = modelTransformEvent.last!.yaw;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <Batched
      onPointerDown={onPointerDown}
      slicer={(node) => {
        const isCurrentMantlet =
          node.name ===
          `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}_mask`;
        const isCurrentGun =
          node.name ===
          `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`;

        return isCurrentGun || isCurrentMantlet;
      }}
    />
  );
}

export function TankModel() {
  const protagonist = Duel.use((draft) => draft.protagonist);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const canvas = useThree((state) => state.gl.domElement);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];

  const { gltf } = useModel(protagonist.tank.id);

  useTankTransform(track, turret, turretContainer, gunContainer);

  return (
    <ModelTankWrapper ref={hullContainer}>
      <Tracks map={gltf} />
      <Hull map={gltf} />

      <group ref={turretContainer}>
        <Turret map={gltf} />

        <group ref={gunContainer}>
          <Gun map={gltf} />
        </group>
      </group>
    </ModelTankWrapper>
  );
}
