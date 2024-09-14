import { EventManager } from '@blitzkit/core';
import { invalidate } from '@react-three/fiber';

export interface ModelTransformEventData {
  yaw?: number;
  pitch: number;
}

export const modelTransformEvent = new EventManager<ModelTransformEventData>();
modelTransformEvent.on(() => invalidate());
