import type { CompensationComponent } from '@protos/blitz_static_compensation_component';
import type { TankCatalogComponent } from '@protos/blitz_static_tank_component';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../core/zustand/createContextualStore';

interface TankopediaEphemeral_ue {
  tank: TankCatalogComponent;
  compensation: CompensationComponent;
}

export const TankopediaEphemeral_ue = createContextualStore(
  (data: TankopediaEphemeral_ue) => {
    return create<TankopediaEphemeral_ue>()(
      subscribeWithSelector<TankopediaEphemeral_ue>(() => data),
    );
  },
);
