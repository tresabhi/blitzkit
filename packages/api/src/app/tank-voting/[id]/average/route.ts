import { tankDefinitions, TankVotes, usersDatabase } from '@blitzkit/core';
import { NextRequest, NextResponse } from 'next/server';
import { isValidBlitzId } from '../../../../../../website/src/core/blitz/isValidBlitzId';
import {
  BlitzkitResponse,
  BlitzkitResponseError,
} from '../../../../../../website/src/hooks/useTankVotes';

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
    } satisfies BlitzkitResponseError);
  }

  const blitzIdString = request.nextUrl.searchParams.get('player');
  const blitzId = Number(blitzIdString);
  const blitzToken = request.nextUrl.searchParams.get('token');

  if ((blitzIdString === null) !== (blitzToken === null)) {
    return NextResponse.json({
      status: 'error',
      error: 'UNDEFINED_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponseError);
  }

  if (
    blitzIdString !== null &&
    (!(await isValidBlitzId(blitzId, blitzToken ?? undefined)) ||
      isNaN(blitzId))
  ) {
    return NextResponse.json({
      status: 'error',
      error: 'INVALID_TOKEN_OR_PLAYER_ID',
    } satisfies BlitzkitResponseError);
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
    } satisfies BlitzkitResponseError);
  }
}
