import { NextResponse } from 'next/server';
import { tankopedia } from '../../../core/blitzkrieg/tankopedia';

export async function GET() {
  return NextResponse.json(await tankopedia);
}
