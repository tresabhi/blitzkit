'use client';

import { Flex, Link } from '@radix-ui/themes';
import { use } from 'react';
import { AdHorizontal } from '../../../../components/Ads/Horizontal';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzrinth/tankDefinitions';

export default function Page() {
  const awaitedTankDefinitions = use(tankDefinitions);

  return (
    <PageWrapper>
      <title>Super duper secret map for SEO</title>

      <AdHorizontal />

      <Flex direction="column" align="center">
        {Object.values(awaitedTankDefinitions)
          .sort((a, b) => b.tier - a.tier)
          .map((tank) => (
            <Link href={`./${tank.id}`} key={tank.id}>
              {tank.name}
            </Link>
          ))}
      </Flex>
    </PageWrapper>
  );
}
