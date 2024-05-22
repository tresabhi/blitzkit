import {
  CaretLeftIcon,
  CaretRightIcon,
  SymbolIcon,
} from '@radix-ui/react-icons';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { range } from 'lodash';
import { useEffect, useRef } from 'react';
import { infiniteSpin } from './index.css';

interface PageTurnerProps {
  leaderboard: Record<number, number>;
  page: number;
  rowsPerPage: number;
  pages: number;
  onPageChange: (page: number, isButtonClick: boolean) => void;
  totalPlayers: number;
}

export function PageTurner({
  page,
  rowsPerPage,
  onPageChange,
  pages,
  leaderboard,
  totalPlayers,
}: PageTurnerProps) {
  const pageInput = useRef<HTMLInputElement>(null);
  const rightLoading = range(
    page * rowsPerPage,
    Math.min(totalPlayers - 1, page * rowsPerPage + rowsPerPage + 1),
  ).some((index) => !(index in leaderboard));
  const leftLoading = range(
    Math.max(0, page * rowsPerPage - 1),
    Math.max(0, page * rowsPerPage - rowsPerPage - 1) + 1,
  ).some((index) => !(index in leaderboard));

  useEffect(() => {
    if (pageInput.current) pageInput.current.value = `${page + 1}`;
  }, [page]);

  return (
    <Flex justify="center" wrap="wrap" gap="2">
      <Flex gap="2">
        <IconButton
          variant="soft"
          onClick={() => onPageChange(Math.max(page - 1, 0), true)}
          disabled={page === 0 || leftLoading}
        >
          {leftLoading ? (
            <SymbolIcon className={infiniteSpin} />
          ) : (
            <CaretLeftIcon />
          )}
        </IconButton>

        <TextField.Root
          type="number"
          ref={pageInput}
          style={{ textAlign: 'center' }}
          min={1}
          max={pages}
          onBlur={(event) => {
            onPageChange(
              Math.max(0, Math.min(pages - 1, event.target.valueAsNumber - 1)),
              false,
            );
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              (event.target as HTMLInputElement).blur();
            }
          }}
        >
          <TextField.Slot>Page</TextField.Slot>
          <TextField.Slot>out of {pages}</TextField.Slot>
        </TextField.Root>
        <IconButton
          variant="soft"
          onClick={() => {
            onPageChange(Math.min(page + 1, pages - 1), true);
          }}
          disabled={page === pages - 1 || rightLoading}
        >
          {rightLoading ? (
            <SymbolIcon className={infiniteSpin} />
          ) : (
            <CaretRightIcon />
          )}
        </IconButton>
      </Flex>
    </Flex>
  );
}
