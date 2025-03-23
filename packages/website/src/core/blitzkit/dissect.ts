import { EventManager } from '@blitzkit/core';

export interface DissectEventData {
  rotation: number;
  offset: number;
}

export const dissectEvent = new EventManager<DissectEventData>();

export const lastDissection: DissectEventData = { rotation: 0, offset: 0 };

dissectEvent.on((data) => Object.assign(lastDissection, data));
