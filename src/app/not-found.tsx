'use client';

import { DiscordLogoIcon, HomeIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import PageWrapper from '../components/PageWrapper';

const redirects = new Map([
  ['/tools/ratings', '/tools/rating'],
  ['/tools/tank-performance', '/tools/performance'],
]);

export default function Page() {
  const pathname = usePathname();

  redirects.forEach((to, from) => {
    if (pathname.startsWith(from)) {
      redirect(to);
    }
  });

  return (
    <PageWrapper>
      <Flex direction="column" justify="center" align="center" flexGrow="1">
        <Heading>404: page not found</Heading>
        <Text color="gray">Where would you like to go?</Text>

        <Flex mt="4" gap="2">
          <Link href="/">
            <Button>
              <HomeIcon /> Home
            </Button>
          </Link>
          <Link href="https://discord.gg/nDt7AjGJQH">
            <Button variant="outline">
              <DiscordLogoIcon /> Discord
            </Button>
          </Link>
        </Flex>
      </Flex>
    </PageWrapper>
  );
}
