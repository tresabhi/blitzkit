import { imgur, ImgurSize } from '@blitzkit/core';
import { Box, Flex, Link, Text } from '@radix-ui/themes';
import { capitalize } from 'lodash-es';
import { PreviewWrapper } from '../../../../components/Embeds/PreviewWrapper';
import { LinkI18n } from '../../../../components/LinkI18n';
import { PageWrapper } from '../../../../components/PageWrapper';
import {
  embedConfigurations,
  extractEmbedConfigDefaults,
} from '../../../../constants/embeds';
import { Var } from '../../../../core/radix/var';
import { useLocale } from '../../../../hooks/useLocale';
import { App } from '../../../../stores/app';
import { EmbedState } from '../../../../stores/embedState';

export function Page() {
  return (
    <App.Provider>
      <Content />
    </App.Provider>
  );
}

function Content() {
  // const wargaming = App.useDeferred((state) => state.logins.wargaming, {
  //   token: '',
  //   id: 0,
  //   expires: 0,
  // });

  const { locale } = useLocale();

  return (
    <PageWrapper color="red">
      {/* {!wargaming && (
        <Flex direction="column" align="center" gap="2">
          <Callout.Root>
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              <Flex align="center">You must log in to generate embeds.</Flex>
            </Callout.Text>
          </Callout.Root>

          <WargamingLoginButton>Log in with Wargaming</WargamingLoginButton>
        </Flex>
      )} */}

      <Text align="center" mt="3">
        More embeds coming soon.{' '}
        <Link
          underline="always"
          href="https://discord.gg/nDt7AjGJQH"
          target="_blank"
        >
          Suggest ideas
        </Link>
        .
      </Text>

      <Flex justify="center">
        {Object.entries(embedConfigurations).map(([embed, config]) => (
          <EmbedState.Provider
            key={embed}
            data={extractEmbedConfigDefaults(config)}
          >
            <LinkI18n
              locale={locale}
              href={`/tools/embed/${embed}`}
              color="gray"
              highContrast
              style={{
                width: 'fit-content',
                height: 'fit-content',
              }}
              underline="hover"
            >
              <Flex
                direction="column"
                overflow="hidden"
                style={{
                  borderRadius: Var('radius-4'),
                  backgroundColor: Var('color-panel-solid'),
                  boxShadow: Var('shadow-3'),
                }}
              >
                <Flex justify="center" p="2">
                  <Text>{capitalize(embed)}</Text>
                </Flex>

                <Box
                  width="20rem"
                  height="20rem"
                  overflow="hidden"
                  position="relative"
                  style={{
                    backgroundImage: `url(${imgur('SO13zur', { format: 'jpeg', size: ImgurSize.SmallThumbnail })})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <PreviewWrapper
                    naked
                    name={embed as keyof typeof embedConfigurations}
                  />
                </Box>
              </Flex>
            </LinkI18n>
          </EmbedState.Provider>
        ))}
      </Flex>
    </PageWrapper>
  );
}
