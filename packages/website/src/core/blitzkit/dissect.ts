import { EventManager } from '@blitzkit/core';
import { degToRad } from 'three/src/math/MathUtils.js';
import { lastModuleSelect, moduleSelectEvent } from './moduleSelect';

export interface DissectEventData {
  rotation: number;
  offset: number;
}

export const dissectEvent = new EventManager<DissectEventData>();

export const lastDissection: DissectEventData = {
  rotation: degToRad(100),
  offset: 0.8,
};

dissectEvent.on((data) => {
  if (lastModuleSelect.selected) moduleSelectEvent.emit({ selected: false });
  Object.assign(lastDissection, data);
});
