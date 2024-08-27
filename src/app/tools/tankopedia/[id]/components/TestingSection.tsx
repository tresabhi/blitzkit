import { Callout, Flex } from '@radix-ui/themes';
import { ExperimentIcon } from '../../../../../components/ExperimentIcon';
import * as Duel from '../../../../../stores/duel';

export function TestingSection() {
  const tank = Duel.use((state) => state.protagonist.tank);

  if (!tank.testing) return null;

  return (
    <Flex justify="center" mb="4">
      <Callout.Root>
        <Callout.Icon>
          <ExperimentIcon style={{ width: '1em', height: '1em' }} />
        </Callout.Icon>
        <Callout.Text>
          Tanks in testing are subject to change and may not represent the final
          product.
        </Callout.Text>
      </Callout.Root>
    </Flex>
  );
}
