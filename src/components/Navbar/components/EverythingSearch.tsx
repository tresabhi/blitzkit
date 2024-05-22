import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Card, TextField } from '@radix-ui/themes';
import { ComponentProps, useState } from 'react';

export function EverythingSearch({
  style,
  ...props
}: ComponentProps<typeof TextField.Root>) {
  const [search, setSearch] = useState('');

  return (
    <>
      <TextField.Root
        value={search}
        placeholder="Search tanks, players, clans..."
        style={{ position: 'relative', ...style }}
        onChange={(event) => {
          setSearch(event.target.value.trim());
        }}
        {...props}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>

        {search.length > 0 && (
          <TextField.Slot>
            <Card
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '100%',
                zIndex: 1,
              }}
            />
          </TextField.Slot>
        )}
      </TextField.Root>
    </>
  );
}
