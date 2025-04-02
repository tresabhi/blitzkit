import { assertSecret } from '@blitzkit/core';
import {
  FileTextIcon,
  OpenInNewWindowIcon,
  RocketIcon,
} from '@radix-ui/react-icons';
import {
  Button,
  Code,
  Dialog,
  Flex,
  IconButton,
  Inset,
  Link,
  Separator,
  Table,
} from '@radix-ui/themes';
import { BlitzKitTheme } from '../../../components/BlitzKitTheme';
import type { APIPath } from './index.astro';

interface SlugsTableProps {
  slugs: APIPath['slugs'];
  path: string;
}

interface TableRootProps {
  slugs: NonNullable<APIPath['slugs']>;
  path: string;
}

function TableRoot({ slugs, path }: TableRootProps) {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell width="0">#</Table.ColumnHeaderCell>

          {slugs.titles.map((title) => (
            <Table.ColumnHeaderCell>
              <Code variant="ghost">{title}</Code>
            </Table.ColumnHeaderCell>
          ))}

          <Table.ColumnHeaderCell width="0">Test</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {slugs.groups.map((group, groupIndex) => {
          let draftPath = path;

          slugs.titles.forEach((title) => {
            draftPath = draftPath.replace(
              `[${title}]`,
              `${group[title] ?? ''}`,
            );
          });

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

              <Table.Cell align="right">
                <Link target="_blank" href={`/api/${draftPath}`}>
                  <IconButton variant="solid">
                    <RocketIcon />
                  </IconButton>
                </Link>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

export function SlugsTable({ slugs, path }: SlugsTableProps) {
  if (slugs === undefined) return null;

  return (
    <BlitzKitTheme>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button color="amber">
            Slugs <OpenInNewWindowIcon />
          </Button>
        </Dialog.Trigger>

        <Dialog.Content>
          <Inset>
            <TableRoot slugs={slugs} path={path} />
          </Inset>
        </Dialog.Content>
      </Dialog.Root>
    </BlitzKitTheme>
  );
}

interface SchemaProps {
  schema: string;
  name: string;
}

export function Schema({ schema, name }: SchemaProps) {
  return (
    <BlitzKitTheme>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button color="amber" variant="outline">
            Schema <FileTextIcon />
          </Button>
        </Dialog.Trigger>

        <Dialog.Content>
          <Flex direction="column" gap="5">
            <Link
              target="_blank"
              href={`https://github.com/${assertSecret(
                import.meta.env.PUBLIC_REPO,
              )}/blob/${assertSecret(
                import.meta.env.PUBLIC_BRANCH,
              )}/packages/core/src/protos/${name}.proto`}
            >
              <Code>{name}.proto</Code> on GitHub <OpenInNewWindowIcon />
            </Link>

            <Separator size="4" />

            <Code
              color="gray"
              highContrast
              variant="ghost"
              style={{ whiteSpace: 'pre' }}
            >
              {schema}
            </Code>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </BlitzKitTheme>
  );
}
