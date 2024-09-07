import { NextResponse } from 'next/server';
import { assertSecret } from '../../../../../core/blitzkit/secret';

export async function GET(
  request: Request,
  { params }: { params: { token: string } },
) {
  const response = await fetch(
    `https://www.patreon.com/api/oauth2/token?grant_type=refresh_token&refresh_token=${
      params.token
    }&client_id=${assertSecret(
      process.env.NEXT_PUBLIC_PATREON_CLIENT_ID,
    )}&client_secret=${assertSecret(process.env.PATREON_CLIENT_SECRET)}`,
    { method: 'POST' },
  );
  const json = await response.json();

  return NextResponse.json(json);
}
