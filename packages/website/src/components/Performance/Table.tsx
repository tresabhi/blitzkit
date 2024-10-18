import { Flex } from '@radix-ui/themes';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';
import { StickyTableRoot } from '../StickyTableRoot';
import { Header } from './Header';
import { Tanks } from './Tanks';

export function TankTable({ skeleton }: MaybeSkeletonComponentProps) {
  return (
    <Flex justify="center">
      <StickyTableRoot
        size={{ initial: '1', sm: '2' }}
        variant="surface"
        style={{ maxWidth: '100%' }}
      >
        <Header />
        <Tanks skeleton={skeleton} />
      </StickyTableRoot>
    </Flex>
  );
}
