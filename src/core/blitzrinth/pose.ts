import { EventManager } from './eventManager';

export enum Pose {
  HullDown,
  FaceHug,
  Default,
}

export const poseEvent = new EventManager<Pose>();
