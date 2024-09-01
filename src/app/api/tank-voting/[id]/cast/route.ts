import { NextRequest, NextResponse } from 'next/server';
import { isValidBlitzId } from '../../../../../core/blitz/isValidBlitzId';
import { tankDefinitions } from '../../../../../core/blitzkit/tankDefinitions';
import { usersDatabase } from '../../../../../databases/users';
import { BlitzkitResponse } from '../../../../../hooks/useTankVotes';
import { StarsInt } from '../../../../tools/tankopedia/[id]/components/Model/MetaSection/components/Stars';

export const TANK_VOTE_CATEGORIES = [
  'easiness',
  'firepower',
  'maneuverability',
  'survivability',
];

export type TankVoteCategory = (typeof TANK_VOTE_CATEGORIES)[number];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const tankId = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;

  if (isNaN(tankId) || !awaitedTankDefinitions[tankId]) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TANK_ID',
    } satisfies BlitzkitResponse);
  }

  const blitzId = Number(request.nextUrl.searchParams.get('player'));

  if (isNaN(blitzId) || !(await isValidBlitzId(blitzId))) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_PLAYER_ID',
    } satisfies BlitzkitResponse);
  }

  const votes: Partial<Record<TankVoteCategory, StarsInt>> = {};
  let recognizedVoteCategories = 0;

  for (const category of TANK_VOTE_CATEGORIES) {
    const voteRaw = request.nextUrl.searchParams.get(category);

    if (voteRaw === null) continue;

    const vote = Number(voteRaw);

    if (isNaN(vote) || !Number.isInteger(vote) || vote < 1 || vote > 5) {
      return NextResponse.json({
        status: 'error',
        error: 'INVALID_VOTE',
      } satisfies BlitzkitResponse);
    }

    votes[category] = vote as StarsInt;
    recognizedVoteCategories++;
  }

  if (recognizedVoteCategories === 0) {
    return NextResponse.json({
      status: 'error',
      error: 'NO_VOTES',
    } satisfies BlitzkitResponse);
  }

  try {
    await usersDatabase.user.upsert({
      where: { blitz_id: blitzId },
      update: {
        last_used: new Date(),
        tank_votes: {
          upsert: {
            where: { id: tankId },
            update: { ...votes, last_updated: new Date() },
            create: { ...votes, id: tankId, last_updated: new Date() },
          },
        },
      },
      create: {
        blitz_id: blitzId,
        last_used: new Date(),
        tank_votes: {
          create: { ...votes, id: tankId, last_updated: new Date() },
        },
      },
    });

    return NextResponse.json({
      status: 'ok',
      data: undefined,
    } satisfies BlitzkitResponse<undefined>);
  } catch (message) {
    return NextResponse.json({
      status: 'error',
      error: 'DATABASE_ERROR',
      message,
    } satisfies BlitzkitResponse);
  }
}
