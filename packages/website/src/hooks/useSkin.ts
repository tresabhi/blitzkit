import { alias } from "@blitzkit/core";
import { useEffect, useRef, useState } from "react";
import type { Group, Material } from "three";
import { GLTFLoader } from "three-stdlib";
import { TRANSITION_ANIMATION_TIME } from "../components/Tankopedia/HeroSection/components/TankSandbox/components/Lighting";
import { Tankopedia } from "../stores/tankopedia";

export interface Skin {
  scene: Group;
  materials: Map<string, Material>;
}

const skins = new Map<string, Promise<Skin>>();
const loadedSkins = new Map<string, Skin>();

async function loadSkin(path: string) {
  const gltf = await new GLTFLoader().loadAsync(path);
  const materials: Material[] = await gltf.parser.getDependencies("material");
  const skin = {
    scene: gltf.scene,
    materials: new Map(materials.map((material) => [material.name, material])),
  };

  loadedSkins.set(path, skin);

  return skin;
}

function skinPath(id: number, skin: number) {
  return alias("api", `/tanks/${id}/skins/${skin}.glb`);
}

export function useSkin(id: number, skin?: number) {
  const [loaded, setLoaded] = useState<Skin>();
  const mounted = useRef(false);

  useEffect(() => {
    const path = skin === undefined ? undefined : skinPath(id, skin);
    const cached = path === undefined ? undefined : loadedSkins.get(path);
    let settled = false;

    if (!mounted.current) {
      mounted.current = true;

      if (path === undefined || cached) {
        setLoaded(cached);
        return;
      }
    }

    Tankopedia.mutate((draft) => {
      draft.revealed = false;
    });

    if (path !== undefined && !skins.has(path)) {
      skins.set(path, loadSkin(path));
    }

    Promise.all([
      path === undefined ? undefined : skins.get(path),
      new Promise((resolve) =>
        setTimeout(resolve, TRANSITION_ANIMATION_TIME * 1e3),
      ),
    ]).then(([loaded]) => {
      if (settled) return;

      settled = true;
      setLoaded(loaded);
      Tankopedia.mutate((draft) => {
        draft.revealed = true;
      });
    });

    return () => {
      if (settled) return;

      settled = true;
      Tankopedia.mutate((draft) => {
        draft.revealed = true;
      });
    };
  }, [id, skin]);

  return loaded;
}
