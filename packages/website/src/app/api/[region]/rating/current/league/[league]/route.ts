import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../constants/regions';
import { getRatingLeague } from '../../../../../../../core/blitz/getRatingLeague';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; league: number } },
) {
  return NextResponse.json(
    await getRatingLeague(params.region, params.league, true),
  );
}
