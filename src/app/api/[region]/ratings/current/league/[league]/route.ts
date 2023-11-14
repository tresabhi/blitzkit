import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../constants/regions';
import { getRatingsLeague } from '../../../../../../../core/blitz/getRatingsLeague';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; league: number } },
) {
  return NextResponse.json(
    await getRatingsLeague(params.region, params.league, true),
  );
}
