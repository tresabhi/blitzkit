import { Flex } from '@radix-ui/themes';
import { ReactNode } from 'react';
import { TanksEmbedState } from '../app/tools/embed/customize/tanks/page';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';

interface TanksEmbedWrapperProps {
  children: ReactNode;
  state: TanksEmbedState;
}

export function TanksEmbedWrapper({ children, state }: TanksEmbedWrapperProps) {
  return (
    <Flex direction="column" gap={state.listGap} width={`${state.listWidth}px`}>
      {children}
    </Flex>
  );
}

interface TanksEmbedCardProps {
  tank: TankDefinition;
  state: TanksEmbedState;
}

export function TanksEmbedCard({ tank, state }: TanksEmbedCardProps) {
  return (
    <Flex
      direction="column"
      style={{
        borderRadius: `var(--radius-${state.cardRadius})`,
        overflow: 'hidden',
        backgroundColor: 'var(--color-panel-solid)',
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: 'var(--color-panel-translucent)',
        }}
        p={state.cardHeaderPadding}
      >
        {tank.name}
      </Flex>
      <Flex>asd</Flex>
    </Flex>
  );
}
