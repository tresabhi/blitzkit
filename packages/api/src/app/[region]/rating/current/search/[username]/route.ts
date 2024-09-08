import { Region } from '@blitzkit/core';
import { searchCurrentRatingPlayers } from '@blitzkit/core/src/blitz/searchCurrentRatingPlayers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; username: string } },
) {
  return NextResponse.json(
    await searchCurrentRatingPlayers(params.region, params.username),
  );
}
