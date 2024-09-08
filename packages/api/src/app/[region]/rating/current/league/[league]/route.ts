import { getRatingLeague, Region } from '@blitzkit/core';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; league: number } },
) {
  return NextResponse.json(
    await getRatingLeague(params.region, params.league, true),
  );
}
