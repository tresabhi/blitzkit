import { Region } from '@blitzkit/core';
import { NextResponse } from 'next/server';
import { searchCurrentRatingPlayers } from '../../../../../../../../website/src/core/blitz/searchCurrentRatingPlayers';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; username: string } },
) {
  return NextResponse.json(
    await searchCurrentRatingPlayers(params.region, params.username),
  );
}
