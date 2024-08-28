import { MinusCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { ExperimentIcon } from '../../../../../components/ExperimentIcon';
import * as Duel from '../../../../../stores/duel';

export function CalloutsSection() {
  const tank = Duel.use((state) => state.protagonist.tank);

  if (!tank.testing && !tank.deprecated) return null;

  return (
    <Flex direction="column" align="center" gap="2" mb="4">
      {tank.deprecated && (
        <Callout.Root color="red">
          <Callout.Icon>
            <MinusCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            This tank is deprecated and may display undefined behavior.
          </Callout.Text>
        </Callout.Root>
      )}

      {tank.testing && (
        <Callout.Root color="red">
          <Callout.Icon>
            <ExperimentIcon style={{ width: '1em', height: '1em' }} />
          </Callout.Icon>
          <Callout.Text>
            Tanks in testing are subject to change and may not represent the
            final product.
          </Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
