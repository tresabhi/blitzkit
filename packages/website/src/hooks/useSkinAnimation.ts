import { invalidate, useFrame } from "@react-three/fiber";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import {
  createSkinRuntime,
  GARAGE_EVENT,
  type SkinRuntime,
} from "../core/blitzkit/skinAnimations/runtime";
import { Tankopedia } from "../stores/tankopedia";
import type { Skin } from "./useSkin";

// demand rendering can leave long gaps between frames
const MAX_DELTA = 0.1;

export const skinAnimationEvent = new Quicklime<string>();

export function useSkinAnimation(skin?: Skin) {
  const runtime = useRef<SkinRuntime>(undefined);
  const active = useRef(false);

  useEffect(() => {
    if (!skin) return;

    let created: SkinRuntime;

    try {
      created = createSkinRuntime(
        [...skin.parts.values()].flat(),
        skin.animations,
      );
    } catch (error) {
      // the camo still shows, just without animations
      console.warn("Skin animations failed to start", error);
      return;
    }

    function handleSkinAnimation(event: QuicklimeEvent<string>) {
      if (event.data === GARAGE_EVENT) {
        created.replay();
      } else {
        created.trigger(event.data);
      }

      active.current = true;
      invalidate();
    }

    runtime.current = created;
    active.current = true;
    skinAnimationEvent.on(handleSkinAnimation);
    Tankopedia.mutate((draft) => {
      draft.skinEvents = created.hasGarageAnimation
        ? [GARAGE_EVENT, ...created.events]
        : created.events;
    });
    invalidate();

    return () => {
      skinAnimationEvent.off(handleSkinAnimation);
      created.dispose();
      runtime.current = undefined;
      Tankopedia.mutate((draft) => {
        draft.skinEvents = [];
        draft.skinAnimating = false;
      });
    };
  }, [skin]);

  useFrame((_, delta) => {
    if (!runtime.current || !active.current) return;

    active.current = runtime.current.update(Math.min(delta, MAX_DELTA));

    const busy = runtime.current.busy();

    // only on change so the store doesn't update every frame
    if (busy !== Tankopedia.state.skinAnimating) {
      Tankopedia.mutate((draft) => {
        draft.skinAnimating = busy;
      });
    }

    if (active.current) invalidate();
  });
}
