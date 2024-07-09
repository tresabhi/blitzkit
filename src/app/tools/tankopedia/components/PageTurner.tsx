import { CaretLeftIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { useEffect, useRef } from 'react';
import { TankDefinition } from '../../../../core/blitzkit/tankDefinitions';
import * as TankopediaPersistent from '../../../../stores/tankopediaPersistent';

interface PageTurnerProps {
  searchedList: TankDefinition[];
  tanksPerPage: number;
}

export function PageTurner({ searchedList, tanksPerPage }: PageTurnerProps) {
  const page = TankopediaPersistent.use((state) => state.filters.page);
  const mutateTankopediaPersistent = TankopediaPersistent.useMutation();
  const pageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);

  return (
    <Flex align="center" justify="center" gap="2">
      <IconButton
        variant="soft"
        disabled={page === 0}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.filters.page = Math.max(0, page - 1);
          });
        }}
      >
        <CaretLeftIcon />
      </IconButton>
      <TextField.Root
        defaultValue={1}
        type="number"
        ref={pageInput}
        min={1}
        max={Math.floor(searchedList.length / tanksPerPage) + 1}
        style={{ textAlign: 'center' }}
        onBlur={(event) => {
          mutateTankopediaPersistent((draft) => {
            draft.filters.page = Math.max(
              0,
              Math.min(
                Math.floor(searchedList.length / tanksPerPage),
                event.target.valueAsNumber - 1,
              ),
            );
          });
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
          }
        }}
      >
        <TextField.Slot>Page</TextField.Slot>
        <TextField.Slot>
          out of {Math.floor(searchedList.length / tanksPerPage) + 1}
        </TextField.Slot>
      </TextField.Root>
      <IconButton
        variant="soft"
        disabled={Math.floor(searchedList.length / tanksPerPage) === page}
        onClick={() => {
          mutateTankopediaPersistent((draft) => {
            draft.filters.page = Math.min(
              Math.floor(searchedList.length / tanksPerPage),
              page + 1,
            );
          });
        }}
      >
        <CaretRightIcon />
      </IconButton>
    </Flex>
  );
}
