'use client';

import { Table } from '@radix-ui/themes';
import { RootProps } from '@radix-ui/themes/dist/cjs/components/table';
import { useEffect, useRef } from 'react';

export function StickyTableRoot(props: RootProps) {
  const table = useRef<HTMLTableElement>(null);

  useEffect(() => {
    table.current
      ?.querySelector('table')
      ?.style.setProperty('overflow', 'auto');
  }, []);

  return <Table.Root {...props} ref={table} />;
}
