import { Link, Table } from '@radix-ui/themes';
import MarkdownToJSX from 'markdown-to-jsx';

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <MarkdownToJSX
      options={{
        overrides: {
          a: { component: Link },
          table: { component: Table.Root },
          thead: { component: Table.Header },
          tbody: { component: Table.Body },
          tr: { component: Table.Row },
          th: { component: Table.ColumnHeaderCell },
          td: { component: Table.Cell },
        },
      }}
    >
      {children}
    </MarkdownToJSX>
  );
}
