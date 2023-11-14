import { CaretLeftIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, TextField } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';

interface PageTurnerProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function PageTurner({ page, onPageChange, pages }: PageTurnerProps) {
  const pageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);

  return (
    <Flex justify="center" wrap="wrap" gap="2">
      <Flex gap="2">
        <Button
          variant="soft"
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          disabled={page === 0}
        >
          <CaretLeftIcon />
        </Button>
        <TextField.Root>
          <TextField.Slot>Page</TextField.Slot>
          <TextField.Input
            type="number"
            ref={pageInput}
            style={{ width: 64, textAlign: 'center' }}
            onBlur={(event) => {
              onPageChange(
                Math.max(
                  0,
                  Math.min(pages - 1, event.target.valueAsNumber - 1),
                ),
              );
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                (event.target as HTMLInputElement).blur();
              }
            }}
          />
          <TextField.Slot>out of {pages}</TextField.Slot>
        </TextField.Root>
        <Button
          variant="soft"
          onClick={() => {
            onPageChange(Math.min(page + 1, pages - 1));
          }}
          disabled={page === pages - 1}
        >
          <CaretRightIcon />
        </Button>
      </Flex>
    </Flex>
  );
}
