import { NextResponse } from 'next/server';
import { Region } from '../../../../../../../../constants/regions';
import { getRatingsNeighbors } from '../../../../../../../../core/blitz/getRatingsNeighbors';

export async function GET(
  request: Request,
  { params }: { params: { region: Region; id: number; count: number } },
) {
  return NextResponse.json(
    await getRatingsNeighbors(params.region, params.id, params.count),
  );
}
