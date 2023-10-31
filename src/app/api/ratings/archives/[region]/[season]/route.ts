import { NextResponse } from 'next/server';
import { Region } from '../../../../../../constants/regions';
import { getArchivedRatingsLeaderboard } from '../../../../../../core/blitzkrieg/getArchivedRatingsLeaderboard';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; season: number } },
) {
  return NextResponse.json(
    await getArchivedRatingsLeaderboard(params.region, params.season),
  );
}
