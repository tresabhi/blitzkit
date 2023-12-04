import { CaretLeftIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Flex, TextField } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { BlitzkriegTankopediaEntry } from '../../../../core/blitzkrieg/tankopedia';

interface PageTurnerProps {
  page: number;
  setPage: (page: number) => void;
  searchedList: BlitzkriegTankopediaEntry[];
  tanksPerPage: number;
}

export function PageTurner({
  page,
  setPage,
  searchedList,
  tanksPerPage,
}: PageTurnerProps) {
  const pageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);

  return (
    <Flex align="center" justify="center" gap="2">
      <Button
        variant="soft"
        disabled={page === 0}
        onClick={() => setPage(Math.max(0, page - 1))}
      >
        <CaretLeftIcon />
      </Button>
      <TextField.Root>
        <TextField.Slot>Page</TextField.Slot>
        <TextField.Input
          defaultValue={1}
          type="number"
          ref={pageInput}
          min={1}
          max={Math.floor(searchedList.length / tanksPerPage) + 1}
          style={{ width: 64, textAlign: 'center' }}
          onBlur={(event) => {
            setPage(
              Math.max(
                0,
                Math.min(
                  Math.floor(searchedList.length / tanksPerPage),
                  event.target.valueAsNumber - 1,
                ),
              ),
            );
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              (event.target as HTMLInputElement).blur();
            }
          }}
        />
        <TextField.Slot>
          out of {Math.floor(searchedList.length / tanksPerPage) + 1}
        </TextField.Slot>
      </TextField.Root>
      <Button
        variant="soft"
        disabled={Math.floor(searchedList.length / tanksPerPage) === page}
        onClick={() =>
          setPage(
            Math.min(Math.floor(searchedList.length / tanksPerPage), page + 1),
          )
        }
      >
        <CaretRightIcon />
      </Button>
    </Flex>
  );
}
