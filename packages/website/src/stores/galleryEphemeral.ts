import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

interface GalleryEphemeral {
  searching: boolean;
  search?: string;
}

export const GalleryEphemeral = createContextualStore(() => {
  return create<GalleryEphemeral>()(
    subscribeWithSelector<GalleryEphemeral>(() => ({
      searching: false,
    })),
  );
});
