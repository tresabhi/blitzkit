import { NextResponse } from 'next/server';
import { tankAverages } from '../../../core/blitzstars/tankAverages';

export async function GET() {
  return NextResponse.json(await tankAverages);
}
