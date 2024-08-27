import { NextResponse } from 'next/server';
import { assertSecret } from '../../../../../core/blitzkit/secret';

export async function GET(
  request: Request,
  { params }: { params: { code: string } },
) {
  const response = await fetch(
    `https://www.patreon.com/api/oauth2/token?code=${
      params.code
    }&grant_type=authorization_code&client_id=${assertSecret(
      process.env.NEXT_PUBLIC_PATREON_CLIENT_ID,
    )}&client_secret=${assertSecret(
      process.env.PATREON_CLIENT_SECRET,
    )}&redirect_uri=${assertSecret(process.env.NEXT_PUBLIC_PATREON_REDIRECT_URI)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  const json = await response.json();

  return NextResponse.json(json);
}
