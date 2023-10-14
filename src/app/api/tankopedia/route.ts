import { NextResponse } from 'next/server';
import { tankopedia } from '../../../LEGACY_core/blitz/tankopedia';

export async function GET() {
  return NextResponse.json(await tankopedia);
}
