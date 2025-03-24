import { EventManager } from '@blitzkit/core';
import type { Vector3Tuple } from 'three';

export type ModuleSelectEventData =
  | {
      selected: false;
    }
  | {
      selected: true;
      group: string;
      module: string;
      position: Vector3Tuple;
    };

export const moduleSelectEvent = new EventManager<ModuleSelectEventData>();

export const lastModuleSelect: ModuleSelectEventData = { selected: false };

moduleSelectEvent.on((data) => Object.assign(lastModuleSelect, data));
