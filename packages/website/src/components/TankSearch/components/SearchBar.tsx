import type { TankDefinition } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Spinner, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash-es';
import { type KeyboardEventHandler, useCallback, useRef } from 'react';
import { $tankFilters } from '../../../stores/tankFilters';
import { QuickLink } from './QuickLink';
import { Sort } from './Sort';

interface SearchBarProps {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
}

export function SearchBar({ topResult, onSelect }: SearchBarProps) {
  const tankFilters = useStore($tankFilters);
  const input = useRef<HTMLInputElement>(null);
  const performSearch = useCallback(
    debounce(() => {
      // tankFiltersStore.setState({ searching: false });
      $tankFilters.setKey('searching', false);

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      // tankFiltersStore.setState({
      //   search: sanitized.length === 0 ? undefined : sanitized,
      // });
      $tankFilters.setKey(
        'search',
        sanitized.length === 0 ? undefined : sanitized,
      );
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    // if (!tankFiltersStore.getState().searching) {
    //   tankFiltersStore.setState({ searching: true });
    // }
    if (!tankFilters.searching) {
      $tankFilters.setKey('searching', true);
    }

    performSearch();
  }, [tankFilters]);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== 'Enter' || !topResult || tankFilters.searching) return;

      event.preventDefault();

      if (onSelect) {
        onSelect(topResult);
      } else {
        window.location.href = `/tools/tankopedia/${topResult.id}`;
      }
    },
    [topResult],
  );

  return (
    <Flex justify="center" mt="4">
      <Flex gap="2" flexGrow="1">
        <TextField.Root
          defaultValue={tankFilters.search}
          style={{ flex: 1 }}
          ref={input}
          placeholder="Search tanks..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            {tankFilters.searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>

          <QuickLink topResult={topResult} />
        </TextField.Root>

        <Sort />
      </Flex>
    </Flex>
  );
}
