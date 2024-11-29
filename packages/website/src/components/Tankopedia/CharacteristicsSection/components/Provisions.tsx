import { availableProvisions } from '@blitzkit/core';
import { Button, Flex, Heading } from '@radix-ui/themes';
import { awaitableProvisionDefinitions } from '../../../../core/awaitables/provisionDefinitions';
import { Duel } from '../../../../stores/duel';
import { ProvisionsManager } from '../../../ProvisionsManager';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

const provisionDefinitions = await awaitableProvisionDefinitions;

export function Provisions() {
  const mutateDuel = Duel.useMutation();
  const { tank, gun } = Duel.use((state) => state.protagonist);
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const provisionsList = availableProvisions(tank, gun, provisionDefinitions);

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
        disabled={tank.max_provisions === provisions.length}
        onChange={(provisions) => {
          mutateDuel((draft) => {
            draft.protagonist.provisions = provisions;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
