import { CaretRightIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, Spinner, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { KeyboardEventHandler, useCallback, useRef, useState } from 'react';
import { Link } from '../../../../components/Link';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import { useTankopediaFilters } from '../../../../stores/tankopediaFilters';

interface SearchBarProps {
  topResult?: TankDefinition;
}

export function SearchBar({ topResult }: SearchBarProps) {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const search = useCallback(
    debounce(() => {
      setSearching(false);

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      useTankopediaFilters.setState({
        search: sanitized.length === 0 ? undefined : sanitized,
      });
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    setSearching(true);
    search();
  }, []);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== 'Enter' || !topResult) return;

      event.preventDefault();
      router.push(`/tools/tankopedia/${topResult.id}`);
    },
    [topResult],
  );

  return (
    <TextField.Root
      ref={input}
      placeholder="Search tanks..."
      size="3"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    >
      <TextField.Slot>
        {searching ? <Spinner /> : <MagnifyingGlassIcon />}
      </TextField.Slot>

      {topResult && (
        <TextField.Slot>
          <Link href={`/tools/tankopedia/${topResult.id}`}>
            <Button variant="ghost" size="3">
              {topResult.name} <CaretRightIcon />
            </Button>
          </Link>
        </TextField.Slot>
      )}
    </TextField.Root>
  );
}
