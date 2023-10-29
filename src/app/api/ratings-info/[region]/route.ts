import { NextResponse } from 'next/server';
import { Region } from '../../../../constants/regions';
import getRatingsInfo from '../../../../core/blitz/getRatingsInfo';

export async function GET(
  request: Request,
  { params }: { params: { region: Region } },
) {
  return NextResponse.json(await getRatingsInfo(params.region));
}
