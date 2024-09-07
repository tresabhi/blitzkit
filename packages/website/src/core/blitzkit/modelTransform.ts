import { EventManager } from '@blitzkit/core/src/blitzkit/eventManager';
import { invalidate } from '@react-three/fiber';

export interface ModelTransformEventData {
  yaw?: number;
  pitch: number;
}

export const modelTransformEvent = new EventManager<ModelTransformEventData>();
modelTransformEvent.on(() => invalidate());
