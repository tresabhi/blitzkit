import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ProvisionsManager } from '../../../../../../../components/ProvisionsManager';
import { availableProvisions } from '../../../../../../../core/blitzkrieg/availableProvisions';
import { provisionDefinitions } from '../../../../../../../core/blitzkrieg/provisionDefinitions';
import { mutateDuel, useDuel } from '../../../../../../../stores/duel';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Provisions() {
  const { tank, gun } = useDuel((state) => state.protagonist!);
  const provisions = useDuel((state) => state.protagonist!.provisions);
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
              draft.protagonist!.provisions = [];
            });
          }}
        >
          Clear
        </Button>
      </Flex>

      <ProvisionsManager
        provisions={provisionsList.map((provision) => provision.id)}
        selected={provisions}
        disabled={tank.provisions === provisionsList.length}
        onChange={(provisions) => {
          mutateDuel((draft) => {
            draft.protagonist!.provisions = provisions;
          });
        }}
      />
    </ConfigurationChildWrapper>
  );
}
