import { blitzStarsTankAverages } from '@blitzkit/core';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(await blitzStarsTankAverages);
}
