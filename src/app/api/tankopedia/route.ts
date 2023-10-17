import { NextResponse } from 'next/server';
import { tankopedia } from '../../../core/blitzstars/tankopedia';

export async function GET() {
  return NextResponse.json(await tankopedia);
}
