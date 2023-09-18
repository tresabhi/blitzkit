import { NextRequest, NextResponse } from 'next/server';
import listPlayers from '../../../../core/blitz/listPlayers';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search');
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : undefined;
  const players = search ? await listPlayers(search, limit) : [];

  return NextResponse.json(players);
}
