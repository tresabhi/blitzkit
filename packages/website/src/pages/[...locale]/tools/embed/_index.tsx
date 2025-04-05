import { Box, Flex, Link, Text } from '@radix-ui/themes';
import { PreviewWrapper } from '../../../../components/Embeds/PreviewWrapper';
import { LinkI18n } from '../../../../components/LinkI18n';
import { PageWrapper } from '../../../../components/PageWrapper';
import {
  embedConfigurations,
  extractEmbedConfigDefaults,
} from '../../../../constants/embeds';
import { Var } from '../../../../core/radix/var';
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from '../../../../hooks/useLocale';
import { App } from '../../../../stores/app';
import { EmbedState } from '../../../../stores/embedState';

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <App.Provider>
        <Content />
      </App.Provider>
    </LocaleProvider>
  );
}

function Content() {
  const { locale, strings } = useLocale();

  return (
    <PageWrapper color="red">
      <Text align="center" mt="3">
        {strings.website.tools.embed.coming_soon}{' '}
        <Link
          underline="always"
          href="https://discord.gg/nDt7AjGJQH"
          target="_blank"
        >
          {strings.website.tools.embed.suggest}
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
                  <Text>
                    {
                      strings.website.tools.embed.types[
                        embed as keyof typeof strings.website.tools.embed.types
                      ].name
                    }
                  </Text>
                </Flex>

                <Box
                  width="20rem"
                  height="20rem"
                  overflow="hidden"
                  position="relative"
                  style={{
                    backgroundImage:
                      'url(/assets/images/backgrounds/embed-default.webp)',
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
