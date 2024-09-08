import { EventManager } from '@blitzkit/core';

export enum Pose {
  HullDown,
  FaceHug,
  Default,
}

export const poseEvent = new EventManager<Pose>();
