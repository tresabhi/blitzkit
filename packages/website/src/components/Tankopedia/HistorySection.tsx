import { Heading, Text } from '@radix-ui/themes';
import { Duel } from '../../stores/duel';
import { PageWrapper } from '../PageWrapper';

export function HistorySection() {
  const tank = Duel.use((state) => state.protagonist.tank);

  if (!tank.description) return null;

  return (
    <PageWrapper noFlex1 align="center">
      <Heading>History of the {tank.name}</Heading>
      <Text>{tank.description}</Text>
    </PageWrapper>
  );
}
