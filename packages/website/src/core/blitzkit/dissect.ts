import { EventManager } from '@blitzkit/core';
import { degToRad } from 'three/src/math/MathUtils.js';

export interface DissectEventData {
  rotation: number;
  offset: number;
}

export const dissectEvent = new EventManager<DissectEventData>();

export const lastDissection: DissectEventData = {
  rotation: degToRad(100),
  offset: 0.8,
};

dissectEvent.on((data) => Object.assign(lastDissection, data));
