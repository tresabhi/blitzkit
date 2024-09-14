import { TankDefinition } from '@blitzkit/core';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Spinner, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { KeyboardEventHandler, useCallback, useRef } from 'react';
import * as TankFilters from '../../../../stores/tankFilters';
import { QuickLink } from './QuickLink';
import { Sort } from './Sort';

interface SearchBarProps {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
}

export function SearchBar({ topResult, onSelect }: SearchBarProps) {
  const tankFiltersStore = TankFilters.useStore();
  const lastSearch = tankFiltersStore.getState().search;
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const searching = TankFilters.use((state) => state.searching);
  const performSearch = useCallback(
    debounce(() => {
      tankFiltersStore.setState({ searching: false });

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      tankFiltersStore.setState({
        search: sanitized.length === 0 ? undefined : sanitized,
      });
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    if (!tankFiltersStore.getState().searching) {
      tankFiltersStore.setState({ searching: true });
    }

    performSearch();
  }, []);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== 'Enter' || !topResult || searching) return;

      event.preventDefault();

      if (onSelect) {
        onSelect(topResult);
      } else {
        router.push(`/tools/tankopedia/${topResult.id}`);
      }
    },
    [topResult],
  );

  return (
    <Flex justify="center" mt="4">
      <Flex gap="2" flexGrow="1">
        <TextField.Root
          defaultValue={lastSearch}
          style={{ flex: 1 }}
          ref={input}
          placeholder="Search tanks..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>

          <QuickLink topResult={topResult} />
        </TextField.Root>

        <Sort />
      </Flex>
    </Flex>
  );
}
