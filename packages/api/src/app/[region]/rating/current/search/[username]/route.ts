import { Region, searchCurrentRatingPlayers } from '@blitzkit/core';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; username: string } },
) {
  return NextResponse.json(
    await searchCurrentRatingPlayers(params.region, params.username),
  );
}
