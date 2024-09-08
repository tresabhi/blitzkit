import { getRatingInfo } from '@blitzkit/core/src/blitz/getRatingInfo';

export async function isOnGoingRatingSeason() {
  const ratingInfo = await getRatingInfo('com');
  return ratingInfo.detail === undefined;
}
