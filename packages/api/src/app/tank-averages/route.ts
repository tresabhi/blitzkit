import { blitzStarsTankAverages } from '@blitzkit/core/src/blitzstars/tankAverages';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(await blitzStarsTankAverages);
}
