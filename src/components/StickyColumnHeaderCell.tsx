import { Table } from '@radix-ui/themes';
import { ColumnHeaderCellProps } from '@radix-ui/themes/dist/cjs/components/table';

export function StickyColumnHeaderCell({
  style,
  ...props
}: ColumnHeaderCellProps) {
  return (
    <Table.ColumnHeaderCell
      style={{
        position: 'sticky',
        top: 0,
        background: 'var(--gray-3)',
        zIndex: 1,
        ...style,
      }}
      {...props}
    />
  );
}
