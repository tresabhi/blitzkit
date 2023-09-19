import { NextRequest, NextResponse } from 'next/server';
import { Region } from '../../../../../constants/regions';
import getTankStats from '../../../../../core/blitz/getTankStats';
import { NormalizedTankStats } from '../../../../../types/tanksStats';

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region') as Region;
  const id = parseInt(request.nextUrl.searchParams.get('id')!);
  const tankStats = await getTankStats(region, id);
  const normalized = tankStats.reduce<NormalizedTankStats>(
    (accumulator, tank) => ({ ...accumulator, [tank.tank_id]: tank }),
    {},
  );

  return NextResponse.json(normalized);
}
