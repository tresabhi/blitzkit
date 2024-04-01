import { Button, Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ProvisionButton } from '../../../../../../../components/ModuleButtons/ProvisionButton';
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

      <Flex wrap="wrap">
        {provisionsList.map((provision, index) => {
          const selected = provisions.includes(provision.id);

          return (
            <ProvisionButton
              key={provision.id}
              first={index === 0}
              last={index === provisionsList.length - 1}
              rowChild
              disabled={tank.provisions === provisions.length && !selected}
              provision={provision.id}
              selected={selected}
              onClick={() => {
                mutateDuel((draft) => {
                  if (selected) {
                    draft.protagonist!.provisions =
                      draft.protagonist!.provisions.filter(
                        (id) => id !== provision.id,
                      );
                  } else {
                    draft.protagonist!.provisions.push(provision.id);
                  }
                });
              }}
            />
          );
        })}
      </Flex>
    </ConfigurationChildWrapper>
  );
}
