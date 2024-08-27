import { NextResponse } from 'next/server';
import { assertSecrete } from '../../../../../core/blitzkit/secrete';

export async function GET(
  request: Request,
  { params }: { params: { token: string } },
) {
  const response = await fetch(
    `https://www.patreon.com/api/oauth2/token?grant_type=refresh_token&refresh_token=${
      params.token
    }&client_id=${assertSecrete(
      process.env.NEXT_PUBLIC_PATREON_CLIENT_ID,
    )}&client_secret=${assertSecrete(process.env.PATREON_CLIENT_SECRET)}`,
    { method: 'POST' },
  );
  const json = await response.json();

  return NextResponse.json(json);
}
