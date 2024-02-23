import getRatingsInfo from './getRatingsInfo';

export async function isOnGoingRatingsSeason() {
  const ratingsInfo = await getRatingsInfo('com');
  return ratingsInfo.detail === undefined;
}
