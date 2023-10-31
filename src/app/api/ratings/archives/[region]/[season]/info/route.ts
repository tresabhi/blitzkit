import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../constants/regions';
import getArchivedRatingsInfo from '../../../../../../../core/blitzkrieg/getArchivedRatingsInfo';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; season: number } },
) {
  return NextResponse.json(
    await getArchivedRatingsInfo(params.region, params.season),
  );
}
