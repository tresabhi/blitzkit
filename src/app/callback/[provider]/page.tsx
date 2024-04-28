'use client';

import { Flex, Heading, Text } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageWrapper from '../../../components/PageWrapper';
import { mutateApp } from '../../../stores/app';

export default function Page({
  params,
  searchParams,
}: {
  params: { provider: string };
  searchParams: { [key: string]: string };
}) {
  const router = useRouter();

  useEffect(() => {
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
          draft.login = {
            expiresAt: Number(searchParams.expires_at),
            id: Number(searchParams.account_id),
            token: searchParams.access_token,
          };
        });

        break;
      }

      default: {
        console.error(`Unknown provider: ${params.provider}`);
      }
    }

    router.push(searchParams.return ? searchParams.return : '/');
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
