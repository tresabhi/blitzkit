import { Badge, Flex, Heading, Link, Separator, Text } from '@radix-ui/themes';
import { PageWrapper } from 'packages/website-ue/src/components/PageWrapper';
import { ffi } from 'packages/website-ue/src/core/blitzkit/ffi';

export interface Bindings {
  bindings: Binding[];
  forbidden: string[];
}

interface Binding {
  name: string;
  versions: string[];
  discovery: string;
  env: string;
  show_server_selection: boolean;
}

export async function Page() {
  return (
    <PageWrapper>
      <Bindings url={JSON.parse(ffi.get_bindings_url_dev()!)} dev />
      <Separator size="4" />
      <Bindings url={JSON.parse(ffi.get_bindings_url_production()!)} />
    </PageWrapper>
  );
}

async function Bindings({ url, dev }: { url: string; dev?: boolean }) {
  const data = await fetch(url).then(
    (response) => response.json() as Promise<Bindings>,
  );

  return (
    <>
      <Text>
        Bindings URL{' '}
        <Link href={url} target="_blank">
          {url}
        </Link>
      </Text>

      {data.bindings.map((binding) => (
        <Flex direction="column" gap="2" key={binding.name}>
          <Heading>
            <Flex align="center" gap="2">
              {binding.env}

              {!dev && (
                <Badge variant="solid" color="blue">
                  Production
                </Badge>
              )}
              {dev && (
                <Badge variant="solid" color="orange">
                  Dev
                </Badge>
              )}
              {binding.show_server_selection && (
                <Badge color="green">Public</Badge>
              )}
              {!binding.show_server_selection && (
                <Badge color="red">Private</Badge>
              )}
            </Flex>
          </Heading>

          <Text>{binding.name}</Text>

          <Flex gap="2">
            <Text>Discovery:</Text>
            <Link href={binding.discovery} target="_blank">
              {binding.discovery}
            </Link>
          </Flex>

          <Flex gap="2">
            <Text>Versions:</Text>

            {binding.versions.map((version) => (
              <Badge variant="outline" color="gray" key={version}>
                {version}
              </Badge>
            ))}
          </Flex>
        </Flex>
      ))}
    </>
  );
}
