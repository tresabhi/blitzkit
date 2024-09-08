import { EventManager } from '@blitzkit/core/src/blitzkit/eventManager';

export enum Pose {
  HullDown,
  FaceHug,
  Default,
}

export const poseEvent = new EventManager<Pose>();
