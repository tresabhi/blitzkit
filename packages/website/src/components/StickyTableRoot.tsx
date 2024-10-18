import { Table } from '@radix-ui/themes';
import type { RootProps } from '@radix-ui/themes/src/components/table.js';
import { useEffect, useRef } from 'react';

export function StickyTableRoot({ style, ...props }: RootProps) {
  const table = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // table.current
    //   ?.querySelector('table')
    //   ?.style.setProperty('overflow', 'auto');
  }, []);

  return (
    <Table.Root
      {...props}
      ref={table}
      style={{ overflow: 'hidden', ...style }}
    />
  );
}
