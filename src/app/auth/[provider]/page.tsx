'use client';

import { Flex, Heading, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { mutateApp } from '../../../stores/app';

export interface PatreonAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: string;
  refresh_token: string;
  version: string;
}

export default function Page({
  params,
  searchParams,
}: {
  params: { provider: string };
  searchParams: { [key: string]: string };
}) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      switch (params.provider) {
        case 'wargaming': {
          if (
            !searchParams.expires_at ||
            !searchParams.access_token ||
            !searchParams.account_id
          ) {
            break;
          }

          mutateApp((draft) => {
            draft.logins.wargaming = {
              id: Number(searchParams.account_id),
              token: searchParams.access_token,
              expires: Number(searchParams.expires_at) * 1000,
            };
          });

          break;
        }

        case 'patreon': {
          if (!searchParams.code) break;

          const data = (await fetch(
            `/api/patreon/auth/${searchParams.code}`,
          ).then((response) => response.json())) as PatreonAuthResponse;

          mutateApp((draft) => {
            draft.logins.patreon = {
              token: data.access_token,
              refreshToken: data.refresh_token,
              expires: Date.now() + data.expires_in * 1000,
            };
          });

          break;
        }

        default: {
          console.error(`Unknown provider: ${params.provider}`);
        }
      }

      router.push(searchParams.return ?? '/');
    })();
  });

  return (
    <PageWrapper>
      <Flex
        style={{ flex: 1 }}
        align="center"
        justify="center"
        direction="column"
        gap="2"
      >
        <Heading>Verifying you...</Heading>
        <Text color="gray">You'll be on your way shortly.</Text>
      </Flex>
    </PageWrapper>
  );
}
