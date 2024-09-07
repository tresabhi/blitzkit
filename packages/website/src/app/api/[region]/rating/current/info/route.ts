import { NextResponse } from 'next/server';
import { Region } from '../../../../../../constants/regions';
import getRatingInfo from '../../../../../../core/blitz/getRatingInfo';

export async function GET(
  request: Request,
  { params }: { params: { region: Region } },
) {
  return NextResponse.json(await getRatingInfo(params.region));
}
