'use client';

import { ImageIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Heading, ScrollArea, Text } from '@radix-ui/themes';
import { capitalize, startCase } from 'lodash';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { NAVBAR_HEIGHT } from '../../../../../components/Navbar';
import PageWrapper from '../../../../../components/PageWrapper';
import { imgur } from '../../../../../core/blitzkit/imgur';
import { EmbedConfig } from '../../../../../stores/embedState';
import { EmbedItemType } from '../../../../../stores/embedState/constants';
import { configurations, previews } from '../../configurations';
import { Boolean } from './components/Boolean';
import { Color } from './components/Color';
import { Radius } from './components/Radius';
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
  const config = configurations[params.embed] as EmbedConfig;
  const Preview = previews[params.embed];
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
            <Heading mb="4">Customize</Heading>

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
                  break;
                }

                case EmbedItemType.Size: {
                  control = <Size configKey={configKey} />;
                  break;
                }

                case EmbedItemType.SizeWithout0: {
                  control = <SizeWithout0 configKey={configKey} />;
                  break;
                }

                case EmbedItemType.Slider: {
                  control = <Slider configKey={configKey} config={item} />;
                  break;
                }

                case EmbedItemType.String: {
                  control = <TextController configKey={configKey} />;
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
                  <Flex gap="2" align="center">
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

            <Flex
              flexGrow="1"
              style={{
                background: `url(${backgroundImage}) center / cover no-repeat`,
              }}
              align="center"
              justify="center"
            >
              <Preview />
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
