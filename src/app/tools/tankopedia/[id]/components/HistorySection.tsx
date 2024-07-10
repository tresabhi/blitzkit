import { Heading, Text } from '@radix-ui/themes';
import PageWrapper from '../../../../../components/PageWrapper';
import * as Duel from '../../../../../stores/duel';

export function HistorySection() {
  const tank = Duel.use((state) => state.protagonist.tank);

  if (!tank.description) return null;

  return (
    <PageWrapper noFlex1>
      <Heading>History of the {tank.name}</Heading>
      <Text>{tank.description}</Text>
    </PageWrapper>
  );
}
