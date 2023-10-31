import { NextResponse } from 'next/server';
import { getArchivedLatestSeasonNumber } from '../../../../core/blitzkrieg/getArchivedLatestSeasonNumber';

export async function GET() {
  return NextResponse.json(await getArchivedLatestSeasonNumber());
}
