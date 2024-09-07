import { Table } from '@radix-ui/themes';
import { ColumnHeaderCellProps } from '@radix-ui/themes/dist/cjs/components/table';

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
