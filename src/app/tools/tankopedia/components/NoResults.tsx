import { Flex, Link, Text } from '@radix-ui/themes';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';

interface NoResultsProps {
  type?: 'filters' | 'search';
}

export function NoResults({ type = 'filters' }: NoResultsProps) {
  return (
    <Flex flexGrow="1" align="center" justify="center">
      <Text color="gray">
        No tanks found.{' '}
        <Link
          href="#"
          underline="always"
          color="red"
          onClick={() =>
            useTankopediaFilters.setState(
              useTankopediaFilters.getInitialState(),
              true,
            )
          }
        >
          {type === 'filters' ? 'Try clearing filters' : 'Try searching again'}
        </Link>
        .
      </Text>
    </Flex>
  );
}
