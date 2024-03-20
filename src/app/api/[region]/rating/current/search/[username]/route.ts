import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../constants/regions';
import { searchCurrentRatingPlayers } from '../../../../../../../core/blitz/searchCurrentRatingPlayers';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; username: string } },
) {
  return NextResponse.json(
    await searchCurrentRatingPlayers(params.region, params.username),
  );
}
