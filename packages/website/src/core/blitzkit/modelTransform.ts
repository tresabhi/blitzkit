import { EventManager } from '@blitzkit/core';

export interface ModelTransformEventData {
  yaw?: number;
  pitch: number;
}

export const modelTransformEvent = new EventManager<ModelTransformEventData>();
