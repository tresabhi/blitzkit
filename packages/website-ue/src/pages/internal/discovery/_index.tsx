import { Flex, Heading, Link, Text } from '@radix-ui/themes';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { ffi } from 'packages/website-ue/src/core/blitzkit/ffi';
import type { Bindings } from '../bindings/_index';

export interface Discovery {
  version: string;
  clusters: string[];
  default_server: string;
  servers: Record<string, DiscoveryServer>;
  icmp_servers: ICMPServers;
  clusters_versions: Record<string, Empty[]>;
  countries_by_clusters: CountriesByClusters;
  extensions: Extensions;
}

interface Empty {
  version: string;
  server: string;
}

type CountriesByClusters = Record<string, { countries: string[] }>;

interface Extensions {
  endpoints: Record<string, Endpoint>;
}

interface Endpoint {
  playability_config_url: string;
  fullscreen_notifications_url: string;
  mgg_frontier_url: string;
  mgg_pay_url: string;
}

interface ICMPServers {
  default: Record<string, string[]>;
}

export interface DiscoveryServer {
  name: string;
  addr: string;
  addr_dsapp?: string;
}

const servers: DiscoveryServer[] = [];

async function populate(url: string) {
  const { bindings } = await fetch(url).then(
    (response) => response.json() as Promise<Bindings>,
  );

  await Promise.all(
    bindings.map(async (binding) => {
      const discovery = await fetch(binding.discovery).then(
        (response) => response.json() as Promise<Discovery>,
      );

      Object.values(discovery.servers).map((server) => {
        const doesInclude = servers.some((s) => s.addr === server.addr);
        if (!doesInclude) servers.push(server);
      });
    }),
  );
}

await Promise.all([
  populate(JSON.parse(ffi.get_bindings_url_dev()!)),
  populate(JSON.parse(ffi.get_bindings_url_production()!)),
]);

servers.sort((a, b) => a.name.localeCompare(b.name));

export function Page() {
  return (
    <PageWrapper>
      {servers.map((server) => (
        <Flex direction="column" key={server.addr}>
          <Heading>{server.name}</Heading>

          <Text>
            Address:{' '}
            <Link href={server.addr} target="_blank">
              {server.addr}
            </Link>
          </Text>

          {server.addr_dsapp && (
            <Text>
              DSApp:{' '}
              <Link href={server.addr_dsapp} target="_blank">
                {server.addr_dsapp}
              </Link>
            </Text>
          )}
        </Flex>
      ))}
    </PageWrapper>
  );
}
