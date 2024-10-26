import { imgur } from '@blitzkit/core';
import {
  CodeIcon,
  HeightIcon,
  ImageIcon,
  Link2Icon,
  ResetIcon,
  TimerIcon,
  WidthIcon,
} from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes';
import { capitalize, startCase } from 'lodash-es';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { stringify } from 'urlon';
import { CopyButton } from '../../../../components/CopyButton';
import { Boolean } from '../../../../components/Embeds/Boolean';
import { Color } from '../../../../components/Embeds/Color';
import { Enum } from '../../../../components/Embeds/Enum';
import { Import } from '../../../../components/Embeds/Import';
import { PreviewWrapper } from '../../../../components/Embeds/PreviewWrapper';
import { Radius } from '../../../../components/Embeds/Radius';
import { RichText } from '../../../../components/Embeds/RichText';
import { Size } from '../../../../components/Embeds/Size';
import { SizeWithout0 } from '../../../../components/Embeds/SizeWithout0';
import { Slider } from '../../../../components/Embeds/Slider';
import { TextController } from '../../../../components/Embeds/TextController';
import { PageWrapper } from '../../../../components/PageWrapper';
import {
  configurations,
  extractEmbedConfigDefaults,
} from '../../../../constants/embeds';
import { NAVBAR_HEIGHT } from '../../../../constants/navbar';
import { App } from '../../../../stores/app';
import {
  EmbedState,
  type EmbedConfig,
  type EmbedStateStore,
} from '../../../../stores/embedState';
import { EmbedItemType } from '../../../../stores/embedState/constants';

export interface EmbedPreviewControllerProps {
  configKey: string;
}

interface PageProps {
  embed: keyof typeof configurations;
}

export function Page({ embed }: PageProps) {
  const config = configurations[embed];

  return (
    <App.Provider>
      <EmbedState.Provider data={extractEmbedConfigDefaults(config)}>
        <Content embed={embed} />
      </EmbedState.Provider>
    </App.Provider>
  );
}

function Content({ embed }: PageProps) {
  const embedStateStore = EmbedState.useStore();
  const appStore = App.useStore();
  const config = configurations[embed] as EmbedConfig;
  const [backgroundImage, setBackgroundImage] = useState(imgur('SO13zur'));
  const fileInput = useRef<HTMLInputElement>();

  useEffect(() => {
    fileInput.current = document.createElement('input');
    fileInput.current.type = 'file';
    fileInput.current.style.display = 'none';
    fileInput.current.accept = 'image/*';
    fileInput.current.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setBackgroundImage(URL.createObjectURL(file));
    };
  }, []);

  return (
    <PageWrapper padding="0" size={1028 + 640} color="red">
      <Flex>
        <ScrollArea
          scrollbars="vertical"
          style={{ height: '100%', maxWidth: 320 }}
        >
          <Flex direction="column" gap="2" p="4">
            <Import />

            <Heading>Export</Heading>
            <Text size="2" color="gray" mb="2">
              Copy all properties for you streaming software
            </Text>

            <Flex mb="6" gap="2" wrap="wrap">
              <CopyButton
                copy={() => {
                  const { wargaming } = appStore.getState().logins;

                  if (!wargaming) return;

                  const state = embedStateStore.getState();
                  const initial = embedStateStore.getInitialState();
                  const shallowState: EmbedStateStore = {};

                  Object.entries(state).forEach(([key, value]) => {
                    if (value !== initial[key]) {
                      shallowState[key] = value;
                    }
                  });

                  const searchParams = new URLSearchParams({
                    id: `${wargaming.id}`,
                    state: stringify(shallowState),
                  });

                  return `${location.origin}/tools/embed/${embed}/host?${searchParams.toString()}`;
                }}
              >
                <Link2Icon />
                Copy URL
              </CopyButton>
              <CopyButton
                variant="outline"
                copy={() =>
                  'body { margin: 0; background-color: transparent; overflow: hidden; }'
                }
              >
                <CodeIcon />
                Copy CSS
              </CopyButton>
              <CopyButton
                variant="outline"
                copy={() => `${embedStateStore.getState().width}`}
              >
                <WidthIcon />
                Copy width
              </CopyButton>
              <CopyButton
                variant="outline"
                copy={() => `${embedStateStore.getState().height}`}
              >
                <HeightIcon />
                Copy height
              </CopyButton>
              <CopyButton variant="outline" copy={() => '`'}>
                <TimerIcon />
                Copy framerate
              </CopyButton>
            </Flex>

            <Flex justify="between" align="center">
              <Heading>Customize</Heading>
              <Button
                color="red"
                variant="ghost"
                onClick={() => {
                  embedStateStore.setState(
                    embedStateStore.getInitialState(),
                    true,
                  );
                }}
              >
                <ResetIcon /> Reset
              </Button>
            </Flex>
            <Text size="2" color="gray" mb="2">
              Bells and whistles of your embed
            </Text>

            {Object.keys(config).map((configKey) => {
              const item = config[configKey];
              let control: ReactNode;
              let oneLiner = false;

              switch (item.type) {
                case EmbedItemType.Boolean: {
                  control = <Boolean configKey={configKey} />;
                  oneLiner = true;
                  break;
                }

                case EmbedItemType.Color: {
                  control = <Color configKey={configKey} />;
                  break;
                }

                case EmbedItemType.Radius: {
                  control = <Radius configKey={configKey} />;
                  oneLiner = true;
                  break;
                }

                case EmbedItemType.Size: {
                  control = <Size configKey={configKey} />;
                  oneLiner = true;
                  break;
                }

                case EmbedItemType.SizeWithout0: {
                  control = <SizeWithout0 configKey={configKey} />;
                  oneLiner = true;
                  break;
                }

                case EmbedItemType.Slider: {
                  control = <Slider configKey={configKey} config={item} />;
                  oneLiner = true;
                  break;
                }

                case EmbedItemType.String: {
                  control = <TextController configKey={configKey} />;
                  break;
                }

                case EmbedItemType.RichText: {
                  control = <RichText configKey={configKey} />;
                  break;
                }

                case EmbedItemType.Enum: {
                  control = <Enum configKey={configKey} config={item} />;
                  oneLiner = true;
                  break;
                }
              }

              return (
                <Flex
                  key={configKey}
                  direction={oneLiner ? undefined : 'column'}
                  gap={oneLiner ? '2' : '1'}
                  justify={oneLiner ? 'between' : undefined}
                  mb={oneLiner ? '2' : '4'}
                  pb={item.pad ? '6' : undefined}
                >
                  <Text>{capitalize(startCase(configKey as string))}</Text>
                  <Flex
                    gap="2"
                    align="center"
                    flexGrow="1"
                    justify={oneLiner ? 'end' : undefined}
                  >
                    {control}
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </ScrollArea>

        <Box
          p="4"
          flexGrow="1"
          position="sticky"
          top={`${NAVBAR_HEIGHT}px`}
          height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
        >
          <Flex
            direction="column"
            height="100%"
            style={{
              borderRadius: 'var(--radius-3)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-3)',
            }}
          >
            <Flex
              justify="between"
              align="center"
              p="2"
              pl="3"
              style={{
                backgroundColor: 'var(--color-panel-solid)',
              }}
            >
              <Text color="gray">Example preview</Text>

              <Button
                variant="outline"
                color="gray"
                onClick={() => fileInput.current?.click()}
              >
                <ImageIcon /> Upload test background
              </Button>
            </Flex>

            <Box
              flexGrow="1"
              style={{
                background: `url(${backgroundImage}) center / cover no-repeat`,
              }}
              position="relative"
              overflow="hidden"
            >
              <PreviewWrapper name={embed} />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
