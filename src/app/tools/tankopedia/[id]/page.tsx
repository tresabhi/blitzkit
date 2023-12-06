import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { Flag } from '../../../../components/Flag';
import PageWrapper from '../../../../components/PageWrapper';
import { tankDefinitions } from '../../../../core/blitzkrieg/definitions/tanks';

// get [id] form the path
export default function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const awaitedTankDefinitions = use(tankDefinitions);
  const definition = awaitedTankDefinitions[id];

  return (
    <PageWrapper>
      <Flex gap="2" align="center">
        <Flag nation={definition.nation} />
        <Heading>{definition.name}</Heading>
      </Flex>
    </PageWrapper>
  );
}
