import { Heading, Text } from '@radix-ui/themes';
import PageWrapper from '../../../../../../components/PageWrapper';
import { useDuel } from '../../../../../../stores/duel';

export function HistoricalSection() {
  const tank = useDuel((state) => state.protagonist!.tank);

  if (!tank.description) return null;

  return (
    <PageWrapper>
      <Heading>History of the {tank.name}</Heading>
      <Text>{tank.description}</Text>
    </PageWrapper>
  );
}
