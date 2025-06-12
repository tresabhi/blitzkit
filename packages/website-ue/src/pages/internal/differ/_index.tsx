import type { MessageFns } from '@protos/blitz_static_profile_avatar_component';
import type { Any } from '@protos/google/protobuf/any';
import * as protos from '@protos/index';
import { CommitIcon, ReaderIcon } from '@radix-ui/react-icons';
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
            setLoading(true);

            const diff = await diffServers(serverA!.addr, serverB!.addr);

            setLoading(false);
            setDiff(diff);
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

      {diff !== null && (
        <DiffDisplay
          diff={diff.filter(
            (entry) => entry.type !== CatalogItemDiffType.Unmodified,
          )}
        />
      )}
    </PageWrapper>
  );
}

function DiffDisplay({ diff }: { diff: CatalogDiffEntry[] }) {
  return (
    <Flex direction="column" gap="4">
      {diff.length === 0 && (
        <Text align="center" color="gray">
          Branches are identical
        </Text>
      )}

      {diff.map((entry) => (
        <Flex
          direction="column"
          gap="2"
          style={{
            backgroundColor: Var('gray-3'),
            boxShadow: Var('shadow-3'),
            borderRadius: Var('radius-3'),
            overflow: 'hidden',
          }}
        >
          <Box p="3">
            <Text>
              {diffEmojis[entry.type]} {entry.name}
            </Text>
          </Box>

          <Flex gap="1">
            {(entry.type === CatalogItemDiffType.Removed ||
              entry.type === CatalogItemDiffType.Unmodified) && (
              <ItemDisplay item={entry.item} />
            )}
            {entry.type === CatalogItemDiffType.Modified && (
              <ItemDisplay item={entry.a} />
            )}
            {(entry.type === CatalogItemDiffType.Added ||
              entry.type === CatalogItemDiffType.Unmodified) && (
              <ItemDisplay item={entry.item} />
            )}
            {entry.type === CatalogItemDiffType.Modified && (
              <ItemDisplay item={entry.b} />
            )}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

function ItemDisplay({ item }: { item: CatalogItemAccessor }) {
  const entries = Object.entries(item.components);

  protos;

  return (
    <Flex
      direction="column"
      gap="4"
      flexGrow="1"
      p="3"
      style={{
        backgroundColor: Var('gray-2'),
      }}
    >
      {entries.length === 0 && <Text color="gray">No components</Text>}

      {entries.map(([key, value]) => (
        <ComponentDisplay key={key} name={key} value={value} />
      ))}
    </Flex>
  );
}

function ComponentDisplay({ name, value }: { name: string; value: Any }) {
  const [code, setCode] = useState<string | null>(null);

  return (
    <Flex direction="column" gap="1">
      <Flex gap="2" align="center">
        <IconButton
          size="1"
          variant="ghost"
          onClick={() => {
            const messageName = value.type_url
              .slice(2)
              .split('.')
              .slice(1)
              .join('.');
            const json = (
              protos[messageName as keyof typeof protos] as MessageFns<any>
            ).decode(value.value);

            setCode(JSON.stringify(json, null, 2));
          }}
        >
          <ReaderIcon />
        </IconButton>

        <Code color="gray" highContrast variant="ghost">
          {name}
        </Code>
        <Badge>{value.value.length.toLocaleString()}B</Badge>
      </Flex>

      {code !== null && (
        <Code
          ml="4"
          size="1"
          color="gray"
          highContrast
          style={{ whiteSpace: 'pre' }}
        >
          {code}
        </Code>
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
