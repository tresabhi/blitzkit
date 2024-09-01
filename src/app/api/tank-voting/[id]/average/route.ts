import { NextRequest, NextResponse } from 'next/server';
import { isValidBlitzId } from '../../../../../core/blitz/isValidBlitzId';
import { tankDefinitions } from '../../../../../core/blitzkit/tankDefinitions';
import { usersDatabase } from '../../../../../databases/users';
import { BlitzkitResponse } from '../../../../../hooks/useTankVotes';
import { TankVoteCategory } from '../cast/route';

export interface TankVotes {
  categories: Record<TankVoteCategory, number | null>;
  votes: number;
  last_updated?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const awaitedTankDefinitions = await tankDefinitions;

  if (isNaN(id) || !awaitedTankDefinitions[id]) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TANK_ID',
    } satisfies BlitzkitResponse<TankVotes>);
  }

  const blitzIdString = request.nextUrl.searchParams.get('player');
  const blitzId = Number(blitzIdString);
  const blitzToken = request.nextUrl.searchParams.get('token');

  if ((blitzIdString === null) !== (blitzToken === null)) {
    return NextResponse.json({
      status: 'error',
      error: 'UNDEFINED_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponse<TankVotes>);
  }

  if (
    blitzIdString !== null &&
    (!(await isValidBlitzId(blitzId, blitzToken ?? undefined)) ||
      isNaN(blitzId))
  ) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponse);
  }

  try {
    const aggregation = await usersDatabase.tankVote.aggregate({
      where: { id },
      _count: { id: true },
      _avg: {
        easiness: true,
        firepower: true,
        maneuverability: true,
        survivability: true,
      },
    });
    const userVote = await usersDatabase.tankVote.findUnique({
      where: { id, user_blitz_id: blitzId },
      select: { last_updated: true },
    });

    return NextResponse.json({
      status: 'ok',
      data: {
        categories: aggregation._avg,
        votes: aggregation._count.id,
        last_updated: userVote?.last_updated.getTime(),
      },
    } satisfies BlitzkitResponse<TankVotes>);
  } catch (message) {
    return NextResponse.json({
      status: 'error',
      error: 'DATABASE_ERROR',
      message,
    } satisfies BlitzkitResponse<TankVotes>);
  }
}
