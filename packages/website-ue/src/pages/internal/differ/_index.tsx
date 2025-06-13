import type { MessageFns } from '@protos/blitz_static_profile_avatar_component';
import type { Any } from '@protos/google/protobuf/any';
import * as protos from '@protos/index';
import { ArrowBottomRightIcon, CommitIcon } from '@radix-ui/react-icons';
import {
  Badge,
  Box,
  Code,
  Flex,
  IconButton,
  Select,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { diffLines, type ChangeObject } from 'diff';
import { MetadataAccessor } from 'packages/core/src';
import type { CatalogItemAccessor } from 'packages/core/src/blitz/catalogItemAccessor';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { Var } from 'packages/website-ue/src/core/radix/var';
import { useState } from 'react';
import { fetchMetadata } from 'submodules/blitzkit-closed/src';
import type { DiscoveryServer } from '../discovery/_index';

export function Page({ servers }: { servers: DiscoveryServer[] }) {
  const [serverA, setSeverA] = useState<DiscoveryServer | undefined>(undefined);
  const [serverB, setSeverB] = useState<DiscoveryServer | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [diff, setDiff] = useState<CatalogDiffEntry[] | null>(null);
  const [isError, setIsError] = useState(false);

  return (
    <PageWrapper justify="center">
      <Flex justify="center" align="center" gap="2">
        <Select.Root
          size="3"
          defaultValue="undefined"
          onValueChange={(value) => {
            setSeverA(servers.find((server) => server.name === value));
          }}
        >
          <Select.Trigger style={{ flex: 1, maxWidth: '16rem' }} />
          <Select.Content>
            <Select.Item value="undefined">Select base server</Select.Item>

            {servers.map((server) => (
              <Select.Item key={server.name} value={server.name}>
                {server.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <IconButton
          size="3"
          disabled={!serverA || !serverB}
          onClick={async () => {
            setDiff(null);
            setLoading(true);

            try {
              const diff = await diffServers(serverA!.addr, serverB!.addr);
              setDiff(diff);
            } catch (error) {
              console.error(error);
              setIsError(true);
            }

            setLoading(false);
          }}
        >
          {loading ? <Spinner /> : <CommitIcon />}
        </IconButton>

        <Select.Root
          size="3"
          defaultValue="undefined"
          onValueChange={(value) => {
            setSeverB(servers.find((server) => server.name === value));
          }}
        >
          <Select.Trigger style={{ flex: 1, maxWidth: '16rem' }} />
          <Select.Content>
            <Select.Item value="undefined">Select base server</Select.Item>

            {servers.map((server) => (
              <Select.Item key={server.name} value={server.name}>
                {server.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      {isError && (
        <Text align="center" color="red">
          There was an error generating the diff, check console
        </Text>
      )}
      {diff !== null && (
        <>
          {diff.length === 0 ? (
            <Text align="center" color="gray">
              Branches are identical
            </Text>
          ) : (
            <DiffDisplay
              diff={diff.filter(
                (entry) => entry.type !== CatalogItemDiffType.Unmodified,
              )}
            />
          )}
        </>
      )}
    </PageWrapper>
  );
}

function DiffDisplay({ diff }: { diff: CatalogDiffEntry[] }) {
  return (
    <Flex direction="column" gap="4">
      {diff.map((entry) => (
        <Flex
          key={entry.name}
          direction="column"
          style={{
            backgroundColor: Var('gray-3'),
            boxShadow: Var('shadow-2'),
            borderRadius: Var('radius-3'),
            overflow: 'hidden',
          }}
        >
          <Box p="3">
            <Code color="gray" variant="ghost" highContrast>
              {diffEmojis[entry.type]} {entry.name}
            </Code>
          </Box>

          <Flex>
            {(entry.type === CatalogItemDiffType.Added ||
              entry.type === CatalogItemDiffType.Unmodified) && (
              <ItemDisplay full item={entry.item} />
            )}
            {entry.type === CatalogItemDiffType.Modified && (
              <>
                <ItemDisplay item={entry.a} />
                <ItemDisplay item={entry.b} diff={entry.a} />
              </>
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

function ItemDisplay({
  item,
  full,
  diff,
}: {
  item: CatalogItemAccessor;
  full?: boolean;
  diff?: CatalogItemAccessor;
}) {
  const entries = Object.entries(item.components);

  return (
    <Flex
      direction="column"
      gap="4"
      p="3"
      style={{
        width: full ? '100%' : '50%',
        backgroundColor: Var('gray-2'),
      }}
    >
      {entries.length === 0 && <Text color="gray">No components</Text>}

      {entries.map(([key, value]) => (
        <ComponentDisplay
          key={key}
          name={key}
          value={value}
          diff={diff?.components[key]}
        />
      ))}
    </Flex>
  );
}

function ComponentDisplay({
  name,
  value,
  diff,
}: {
  name: string;
  value: Any;
  diff?: Any;
}) {
  const [code, setCode] = useState<string | ChangeObject<string>[] | null>(
    null,
  );

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" align="center" maxWidth="100%" overflow="hidden">
        <IconButton
          size="1"
          variant="ghost"
          onClick={() => {
            if (code !== null) return setCode(null);

            const messageName = value.type_url
              .slice(2)
              .split('.')
              .slice(1)
              .join('.');
            const Message = protos[
              messageName as keyof typeof protos
            ] as MessageFns<any>;
            const json = Message.decode(value.value);

            if (diff === undefined) {
              setCode(JSON.stringify(json, null, 2));
            } else {
              const b = JSON.stringify(json, null, 2);
              const a = JSON.stringify(Message.decode(diff.value), null, 2);

              setCode(diffLines(a, b));
            }
          }}
        >
          <ArrowBottomRightIcon />
        </IconButton>

        <Code color="gray" variant="ghost">
          {name}
        </Code>
        <Badge color="gray" variant="outline">
          {value.value.length.toLocaleString()}B
        </Badge>
      </Flex>

      {code !== null && (
        <Flex
          direction="column"
          ml="5"
          p="2"
          style={{
            overflowX: 'auto',
            backgroundColor: Var('gray-1'),
            borderRadius: Var('radius-2'),
          }}
        >
          {typeof code === 'string' ? (
            <Code
              size="1"
              color="gray"
              variant="ghost"
              highContrast
              style={{ borderRadius: 0, whiteSpace: 'pre' }}
              children={code}
            />
          ) : (
            code.map((line) => {
              const modified = line.added || line.removed;

              return (
                <Code
                  size="1"
                  color={line.added ? 'green' : line.removed ? 'red' : 'gray'}
                  variant={modified ? 'soft' : 'ghost'}
                  highContrast={!modified}
                  style={{ borderRadius: 0, whiteSpace: 'pre' }}
                  key={line.value}
                  children={line.value}
                />
              );
            })
          )}
        </Flex>
      )}
    </Flex>
  );
}

enum CatalogItemDiffType {
  Unmodified,
  Modified,
  Added,
  Removed,
}

type CatalogDiffEntry = { name: string } & (
  | {
      type: CatalogItemDiffType.Modified;
      a: CatalogItemAccessor;
      b: CatalogItemAccessor;
    }
  | {
      type: Exclude<CatalogItemDiffType, CatalogItemDiffType.Modified>;
      item: CatalogItemAccessor;
    }
);

const diffEmojis: Record<CatalogItemDiffType, string> = {
  [CatalogItemDiffType.Unmodified]: '🩶',
  [CatalogItemDiffType.Modified]: '🟡',
  [CatalogItemDiffType.Added]: '🟢',
  [CatalogItemDiffType.Removed]: '🔴',
};

async function diffServers(urlA: string, urlB: string) {
  const [metadataA, metadataB] = await Promise.all([
    fetchMetadata(urlA),
    fetchMetadata(urlB),
  ]).then((members) =>
    members.map((metadata) => new MetadataAccessor(metadata)),
  );
  const itemNameSet = new Set<string>();

  for (const item in metadataA.items) itemNameSet.add(item);
  for (const item in metadataB.items) itemNameSet.add(item);

  const itemNames = [...itemNameSet].sort();
  const diff: CatalogDiffEntry[] = [];

  for (const name of itemNames) {
    if (name in metadataA.items) {
      if (name in metadataB.items) {
        const a = metadataA.get(name);
        const b = metadataB.get(name);

        if (a.equals(b)) {
          diff.push({ name, type: CatalogItemDiffType.Unmodified, item: a });
        } else {
          diff.push({
            name,
            type: CatalogItemDiffType.Modified,
            a: a,
            b: b,
          });
        }
      } else {
        diff.push({
          name,
          type: CatalogItemDiffType.Removed,
          item: metadataA.get(name),
        });
      }
    } else if (name in metadataB.items) {
      diff.push({
        name,
        type: CatalogItemDiffType.Added,
        item: metadataB.get(name),
      });
    }
  }

  return diff;
}
