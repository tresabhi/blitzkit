import { Flex, Text } from '@radix-ui/themes';
import { times } from 'lodash';
import { ReactNode } from 'react';
import { TanksEmbedState } from '../app/tools/embed/customize/tanks/page';
import {
  toColorVar,
  toRadiusVar,
  toWidthVar,
} from '../app/tools/embed/utilities';
import { TankDefinition } from '../core/blitzkit/tankDefinitions';

interface TanksEmbedWrapperProps {
  children: ReactNode;
  state: TanksEmbedState;
}

export function TanksEmbedWrapper({ children, state }: TanksEmbedWrapperProps) {
  return (
    <Flex
      direction="column"
      gap={state.listGap}
      width={toWidthVar(state.listWidth)}
    >
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
        borderRadius: toRadiusVar(state.cardRadius),
        overflow: 'hidden',
        backgroundColor: toColorVar(state.cardBodyBackgroundColor),
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: toColorVar(state.cardHeaderBackgroundColor),
        }}
        p={state.cardHeaderPadding}
      >
        {tank.name}
      </Flex>

      <Flex p={state.cardBodyPadding}>
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;

          return (
            <Flex
              direction="column"
              align="center"
              gap={state.columnGap}
              flexGrow="1"
            >
              <Text size={state.columnValueSize} color={state.columnValueColor}>
                70{state[`column${column}Unit`]}
              </Text>
              <Text size={state.columnLabelSize} color={state.columnLabelColor}>
                {state[`column${column}Label`]}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
