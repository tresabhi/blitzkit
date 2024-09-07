import { availableProvisions, provisionDefinitions } from '@blitzkit/core';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ProvisionsManager } from '../../../../../../../components/ProvisionsManager';
import * as Duel from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Provisions() {
  const mutateDuel = Duel.useMutation();
  const { tank, gun } = Duel.use((state) => state.protagonist);
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  const provisionsList = availableProvisions(
    tank,
    gun,
    awaitedProvisionDefinitions,
  );

  return (
    <ConfigurationChildWrapper>
      <Flex gap="4" align="center">
        <Heading size="4">Provisions</Heading>
        <Button
          variant="ghost"
          color="red"
          onClick={() => {
            mutateDuel((draft) => {
              draft.protagonist.provisions = [];
            });
          }}
        >
          Clear
        </Button>
      </Flex>

      <ProvisionsManager
        provisions={provisionsList.map((provision) => provision.id)}
        selected={provisions}
        disabled={tank.provisions === provisions.length}
        onChange={(provisions) => {
          mutateDuel((draft) => {
            draft.protagonist.provisions = provisions;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
