import { Table } from '@radix-ui/themes';
import type { ColumnHeaderCellProps } from '@radix-ui/themes/src/components/table.js';

interface StickyColumnHeaderCellProps extends ColumnHeaderCellProps {
  top?: number | string;
}

export function StickyColumnHeaderCell({
  style,
  top = 0,
  ...props
}: StickyColumnHeaderCellProps) {
  return (
    <Table.ColumnHeaderCell
      style={{
        position: 'sticky',
        top,
        background: 'var(--gray-3)',
        zIndex: 1,
        ...style,
      }}
      {...props}
    />
  );
}
