import { Flex, Link, Text } from '@radix-ui/themes';
import { useTankFiltersContext } from '../../../../stores/tankFilters';

interface NoResultsProps {
  type?: 'filters' | 'search';
}

export function NoResults({ type = 'filters' }: NoResultsProps) {
  const tankFiltersContext = useTankFiltersContext();

  return (
    <Flex flexGrow="1" align="center" justify="center">
      <Text color="gray">
        No tanks found.{' '}
        <Link
          href="#"
          underline="always"
          color="red"
          onClick={() =>
            tankFiltersContext.setState(
              tankFiltersContext.getInitialState(),
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
