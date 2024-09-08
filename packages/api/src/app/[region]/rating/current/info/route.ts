import { getRatingInfo, Region } from '@blitzkit/core';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { region: Region } },
) {
  return NextResponse.json(await getRatingInfo(params.region));
}
