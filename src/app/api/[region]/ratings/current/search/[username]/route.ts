import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../constants/regions';
import { searchCurrentRatingsPlayers } from '../../../../../../../core/blitz/searchCurrentRatingsPlayers';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; username: string } },
) {
  return NextResponse.json(
    await searchCurrentRatingsPlayers(params.region, params.username),
  );
}
