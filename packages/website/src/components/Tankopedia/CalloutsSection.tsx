import { MinusCircledIcon } from '@radix-ui/react-icons';
import { Callout, Flex } from '@radix-ui/themes';
import { uniq } from 'lodash-es';
import { useEffect } from 'react';
import { Duel } from '../../stores/duel';
import { TankopediaPersistent } from '../../stores/tankopediaPersistent';
import { ExperimentIcon } from '../ExperimentIcon';
import { MAX_RECENTLY_VIEWED } from '../TankSearch/constants';

export function CalloutsSection() {
  const tank = Duel.use((state) => state.protagonist.tank);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();

  useEffect(() => {
    mutateTankopediaPersistent((draft) => {
      draft.recentlyViewed = uniq([tank.id, ...draft.recentlyViewed]).slice(
        0,
        MAX_RECENTLY_VIEWED,
      );
    });
  }, [tank]);

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
