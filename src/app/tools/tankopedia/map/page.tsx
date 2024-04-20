import { Flex, Link } from '@radix-ui/themes';
import { use } from 'react';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzrinth/tankDefinitions';

export default function Page() {
  const awaitedTankDefinitions = use(tankDefinitions);

  return (
    <PageWrapper>
      <Flex direction="column" align="center">
        {Object.values(awaitedTankDefinitions)
          .sort((a, b) => b.tier - a.tier)
          .map((tank) => (
            <Link href={`./${tank.id}`}>{tank.name}</Link>
          ))}
      </Flex>
    </PageWrapper>
  );
}
