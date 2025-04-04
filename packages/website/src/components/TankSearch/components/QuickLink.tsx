import { type TankDefinition } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { CaretRightIcon } from '@radix-ui/react-icons';
import { Button, TextField } from '@radix-ui/themes';
import { useLocale } from '../../../hooks/useLocale';
import { $tankFilters } from '../../../stores/tankFilters';
import { LinkI18n } from '../../LinkI18n';

interface QuickLinkProps {
  topResult?: TankDefinition;
}

export function QuickLink({ topResult }: QuickLinkProps) {
  const tankFilters = useStore($tankFilters);
  const { locale, unwrap } = useLocale();

  if (!tankFilters.search || !topResult || tankFilters.searching) return null;

  return (
    <TextField.Slot>
      <LinkI18n locale={locale} href={`/tools/tankopedia/${topResult.id}`}>
        <Button variant="ghost">
          {unwrap(topResult.name)} <CaretRightIcon />
        </Button>
      </LinkI18n>
    </TextField.Slot>
  );
}
