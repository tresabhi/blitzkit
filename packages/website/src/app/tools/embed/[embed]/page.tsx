'use client';

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
import { capitalize, startCase } from 'lodash';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { stringify } from 'urlon';
import { CopyButton } from '../../../../components/CopyButton';
import PageWrapper from '../../../../components/PageWrapper';
import { imgur } from '../../../../core/blitzkit/imgur';
import * as App from '../../../../stores/app';
import * as EmbedState from '../../../../stores/embedState';
import { EmbedConfig } from '../../../../stores/embedState';
import { EmbedItemType } from '../../../../stores/embedState/constants';
import { configurations } from '../configurations';
import { Boolean } from './components/Boolean';
import { Color } from './components/Color';
import { Enum } from './components/Enum';
import { Import } from './components/Import';
import { PreviewWrapper } from './components/PreviewWrapper';
import { Radius } from './components/Radius';
import { RichText } from './components/RichText';
import { Size } from './components/Size';
import { SizeWithout0 } from './components/SizeWithout0';
import { Slider } from './components/Slider';
import { Text as TextController } from './components/Text';

export interface EmbedPreviewControllerProps {
  configKey: string;
}

export default function Page({
  params,
}: {
  params: { embed: keyof typeof configurations };
}) {
  const embedStateStore = EmbedState.useStore();
  const appStore = App.useStore();
  const config = configurations[params.embed] as EmbedConfig;
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
    <PageWrapper padding="0" size={1028 + 640}>
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
                  const shallowState: EmbedState.EmbedState = {};

                  Object.entries(state).forEach(([key, value]) => {
                    if (value !== initial[key]) {
                      shallowState[key] = value;
                    }
                  });

                  const searchParams = new URLSearchParams({
                    id: `${wargaming.id}`,
                    state: stringify(shallowState),
                  });

                  return `${location.origin}/tools/embed/${params.embed}/host?${searchParams.toString()}`;
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
          // TODO: re-implement this sticky preview
          // top={`${NAVBAR_HEIGHT}px`}
          // height={`calc(100vh - ${NAVBAR_HEIGHT}px)`}
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
              <PreviewWrapper name={params.embed} />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
