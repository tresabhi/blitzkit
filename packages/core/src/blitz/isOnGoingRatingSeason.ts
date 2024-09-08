import { getRatingInfo } from '@blitzkit/core';

export async function isOnGoingRatingSeason() {
  const ratingInfo = await getRatingInfo('com');
  return ratingInfo.detail === undefined;
}
