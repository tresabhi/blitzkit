import { invalidate } from '@react-three/fiber';
import { EventManager } from './eventManager';

export interface ModelTransformEventData {
  yaw?: number;
  pitch: number;
}

export const modelTransformEvent = new EventManager<ModelTransformEventData>();
modelTransformEvent.on(() => invalidate());
