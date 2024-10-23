import { type TankDefinition } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, Link, TextField } from '@radix-ui/themes';
import { $tankFilters } from '../../../stores/tankFilters';

interface QuickLinkProps {
  topResult?: TankDefinition;
}

export function QuickLink({ topResult }: QuickLinkProps) {
  const tankFilters = useStore($tankFilters);

  if (!tankFilters.search || !topResult || tankFilters.searching) return null;

  return (
    <TextField.Slot>
      <Link href={`/tools/tankopedia/${topResult.id}`}>
        <Button variant="ghost">
          {topResult.name} <CaretRightIcon />
        </Button>
      </Link>
    </TextField.Slot>
  );
}
