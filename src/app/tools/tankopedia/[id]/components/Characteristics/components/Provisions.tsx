import { Flex, Heading } from '@radix-ui/themes';
import { use } from 'react';
import { ProvisionButton } from '../../../../../../../components/ModuleButtons/ProvisionButton';
import { availableProvisions } from '../../../../../../../core/blitzkrieg/availableProvisions';
import { useDuel } from '../../../../../../../stores/duel';
import {
  mutateTankopediaTemporary,
  useTankopediaTemporary,
} from '../../../../../../../stores/tankopedia';
import { ConfigurationChildWrapper } from './ConfigurationChildWrapper';

export function Provisions() {
  const { tank, gun } = useDuel((state) => state.protagonist!);
  const provisions = useTankopediaTemporary((state) => state.provisions);
  const provisionsList = use(availableProvisions(tank, gun));

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">Provisions</Heading>

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
                mutateTankopediaTemporary((draft) => {
                  if (selected) {
                    draft.provisions = draft.provisions.filter(
                      (id) => id !== provision.id,
                    );
                  } else {
                    draft.provisions.push(provision.id);
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
