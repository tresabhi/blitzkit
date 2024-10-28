import { imgur, ImgurSize } from '@blitzkit/core';
import { Box, Flex, Link, Text } from '@radix-ui/themes';
import { capitalize } from 'lodash-es';
import { PreviewWrapper } from '../../../components/Embeds/PreviewWrapper';
import { PageWrapper } from '../../../components/PageWrapper';
import {
  embedConfigurations,
  extractEmbedConfigDefaults,
} from '../../../constants/embeds';
import { Var } from '../../../core/radix/var';
import { EmbedState } from '../../../stores/embedState';

export function Page() {
  return (
    <PageWrapper color="red">
      {Object.entries(embedConfigurations).map(([embed, config]) => (
        <EmbedState.Provider data={extractEmbedConfigDefaults(config)}>
          <Link
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
          </Link>
        </EmbedState.Provider>
      ))}
    </PageWrapper>
  );
}
