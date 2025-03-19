import { Code, Link, Table } from '@radix-ui/themes';
import { useState } from 'react';
import type { APIPath } from './index.astro';

interface SlugsTableProps {
  slugs: APIPath['slugs'];
}

const MAX_UNEXPANDED = 5;

export function SlugsTable({ slugs }: SlugsTableProps) {
  if (slugs === undefined) return null;

  const [expanded, setExpanded] = useState(false);

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell width="0">
            <Code variant="ghost" color="gray">
              #
            </Code>
          </Table.ColumnHeaderCell>

          {slugs.titles.map((title) => (
            <Table.ColumnHeaderCell>
              <Code variant="ghost" color="gray" highContrast>
                {title}
              </Code>
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {slugs.groups.map((group, groupIndex) => {
          if (!expanded && groupIndex >= MAX_UNEXPANDED) return null;

          return (
            <Table.Row>
              <Table.RowHeaderCell>
                <Code variant="ghost" color="gray">
                  {groupIndex}
                </Code>
              </Table.RowHeaderCell>

              {slugs.titles.map((title) => (
                <Table.Cell>
                  <Code variant="ghost" color="gray" highContrast>
                    {group[title]}
                  </Code>
                </Table.Cell>
              ))}
            </Table.Row>
          );
        })}

        <Table.Row style={{ position: 'relative' }}>
          <Table.Cell />
          <Link
            href="#"
            underline="always"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(event) => {
              event.preventDefault();
              setExpanded((state) => !state);
            }}
          >
            {expanded
              ? 'Show less'
              : `View all ${slugs.groups.length.toLocaleString('en')} slugs`}
          </Link>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
