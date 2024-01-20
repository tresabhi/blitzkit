import { EventManager } from './eventManager';

export enum Pose {
  HullDown,
}

export const poseEvent = new EventManager<Pose>();
