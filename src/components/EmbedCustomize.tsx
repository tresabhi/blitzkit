import * as radixColors from '@radix-ui/colors';
import { ImageIcon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  ScrollArea,
  Select,
  Slider,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes';
import { Immutable, produce } from 'immer';
import { capitalize, startCase, times } from 'lodash';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  EmbedConfig,
  EmbedConfigItemType,
  EmbedConfigType,
  ExtractEmbedConfigType,
  RadixColor,
  RadixColorBase,
  RadixColorVariant,
  RadixColorVariantRaw,
  radixGrays,
  RadixRadius,
  RadixSize,
  RadixSizeNo0,
  RadixTextColor,
  RadixTextWeight,
  radixTextWeights,
} from '../app/tools/embed/types';
import {
  extractEmbedConfigDefaults,
  toColorVar,
  toRadiusVar,
} from '../app/tools/embed/utilities';
import { imgur } from '../core/blitzkit/imgur';
import { NAVBAR_HEIGHT } from './Navbar';
import PageWrapper from './PageWrapper';

interface EmbedConfigInputsProps<Config extends EmbedConfig> {
  config: Config;
  preview: (state: ExtractEmbedConfigType<Config>) => ReactNode;
}

export function EmbedCustomize<Config extends EmbedConfig>({
  config,
  preview,
}: EmbedConfigInputsProps<Config>) {
  const [state, setState] = useState(extractEmbedConfigDefaults(config));
  const [backgroundImage, setBackgroundImage] = useState(imgur('SO13zur'));
  const mutateState = useCallback(
    (recipe: (draft: Immutable<ExtractEmbedConfigType<Config>>) => void) => {
      setState(produce(recipe));
    },
    [],
  );

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

            {Object.entries(config).map(([keyUntyped, setting]) => {
              const key = keyUntyped as keyof (
                | Immutable<ExtractEmbedConfigType<Config>>
                | ExtractEmbedConfigType<Config>
              );
              let control: ReactNode;

              switch (setting.type) {
                case EmbedConfigType.Slider: {
                  control = (
                    <Slider
                      value={[state[key] as number]}
                      min={
                        (
                          config[
                            key
                          ] as EmbedConfigItemType<EmbedConfigType.Slider>
                        ).min
                      }
                      max={
                        (
                          config[
                            key
                          ] as EmbedConfigItemType<EmbedConfigType.Slider>
                        ).max
                      }
                      onValueChange={([value]) =>
                        mutateState((draft) => {
                          (draft[key] as number) = value;
                        })
                      }
                    />
                  );
                  break;
                }

                case EmbedConfigType.Boolean: {
                  control = (
                    <Switch
                      checked={state[key] as boolean}
                      onCheckedChange={(checked) =>
                        mutateState((draft) => {
                          (draft[key] as boolean) = checked;
                        })
                      }
                    />
                  );
                  break;
                }

                case EmbedConfigType.FullTextControl: {
                  control = (
                    <>
                      <Select.Root
                        value={`${(state[key] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']).color}`}
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']
                            ).color = value as RadixTextColor;
                          });
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value="undefined">
                            <Box
                              style={{
                                display: 'inline-block',
                                width: '1em',
                                height: '1em',
                                verticalAlign: 'text-top',
                                borderRadius: toRadiusVar('full'),
                                backgroundColor: 'white',
                              }}
                            />{' '}
                            White
                          </Select.Item>
                          <Select.Item value="gray">
                            <Box
                              style={{
                                display: 'inline-block',
                                width: '1em',
                                height: '1em',
                                verticalAlign: 'text-top',
                                borderRadius: toRadiusVar('full'),
                                backgroundColor: 'gray',
                              }}
                            />{' '}
                            Gray
                          </Select.Item>
                          {Object.entries(radixColors)
                            .filter(
                              ([key]) =>
                                !key.endsWith('A') &&
                                !key.endsWith('P3') &&
                                !key.endsWith('Dark') &&
                                !radixGrays.includes(key),
                            )
                            .map(([key]) => (
                              <Select.Item key={key} value={key}>
                                <Box
                                  style={{
                                    display: 'inline-block',
                                    width: '1em',
                                    height: '1em',
                                    verticalAlign: 'text-top',
                                    borderRadius: toRadiusVar('full'),
                                    backgroundColor: toColorVar({
                                      base: key as RadixColorBase,
                                      variant: '9',
                                    }),
                                  }}
                                />{' '}
                                {capitalize(key)}
                              </Select.Item>
                            ))}
                        </Select.Content>
                      </Select.Root>
                      <Select.Root
                        value={
                          (
                            state[
                              key
                            ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']
                          ).size
                        }
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']
                            ).size = value as RadixSizeNo0;
                          });
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {times(9, (index) => (
                            <Select.Item key={index} value={`${index + 1}`}>
                              Size {index + 1}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      <Select.Root
                        value={
                          (
                            state[
                              key
                            ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']
                          ).weight
                        }
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>['default']
                            ).weight = value as RadixTextWeight;
                          });
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {radixTextWeights.map((weight) => (
                            <Select.Item key={weight} value={weight}>
                              {startCase(weight)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </>
                  );
                  break;
                }

                case EmbedConfigType.Number: {
                  control = (
                    <TextField.Root
                      style={{ width: 64 }}
                      type="number"
                      value={state[key] as number}
                      onChange={(event) => {
                        mutateState((draft) => {
                          (draft[key] as number) = (
                            event.target as HTMLInputElement
                          ).valueAsNumber;
                        });
                      }}
                    >
                      {setting.unit && (
                        <TextField.Slot side="right">px</TextField.Slot>
                      )}
                    </TextField.Root>
                  );
                  break;
                }

                case EmbedConfigType.String: {
                  control = (
                    <TextField.Root
                      placeholder="Empty"
                      style={{ width: 64 }}
                      value={state[key] as string}
                      onChange={(event) => {
                        mutateState((draft) => {
                          (draft[key] as string) = (
                            event.target as HTMLInputElement
                          ).value;
                        });
                      }}
                    />
                  );
                  break;
                }

                case EmbedConfigType.SizeNo0:
                case EmbedConfigType.Size: {
                  control = (
                    <Slider
                      value={[Number(state[key])]}
                      min={setting.type === EmbedConfigType.SizeNo0 ? 1 : 0}
                      max={9}
                      onValueChange={([value]) =>
                        mutateState((draft) => {
                          (draft[key] as RadixSize) = `${value}` as RadixSize;
                        })
                      }
                    />
                  );
                  break;
                }

                case EmbedConfigType.Radius: {
                  control = (
                    <Slider
                      value={[
                        (state[key] as RadixRadius) === 'full'
                          ? 5
                          : Number(state[key]),
                      ]}
                      min={0}
                      max={5}
                      onValueChange={([value]) =>
                        mutateState((draft) => {
                          (draft[key] as RadixRadius) = (
                            value === 5 ? 'full' : `${value}`
                          ) as RadixRadius;
                        })
                      }
                    />
                  );
                  break;
                }

                case EmbedConfigType.Color: {
                  control = (
                    <>
                      <Select.Root
                        value={(state[key] as RadixColor).base}
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (draft[key] as RadixColor).base =
                              value as RadixColorBase;
                          });
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {Object.entries(radixColors)
                            .filter(
                              ([key]) =>
                                !key.endsWith('A') &&
                                !key.endsWith('P3') &&
                                !key.endsWith('Dark'),
                            )
                            .map(([key]) => (
                              <Select.Item key={key} value={key}>
                                <Box
                                  style={{
                                    display: 'inline-block',
                                    width: '1em',
                                    height: '1em',
                                    verticalAlign: 'text-top',
                                    borderRadius: toRadiusVar('full'),
                                    backgroundColor: toColorVar({
                                      base: key as RadixColorBase,
                                      variant: '9',
                                    }),
                                  }}
                                />{' '}
                                {capitalize(key)}
                              </Select.Item>
                            ))}
                        </Select.Content>
                      </Select.Root>

                      <Select.Root
                        value={(state[key] as RadixColor).variant}
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (draft[key] as RadixColor).variant =
                              value as RadixColorVariant;
                          });
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          {times(12, (index) => {
                            const variant =
                              `${index + 1}` as RadixColorVariantRaw;

                            return (
                              <>
                                <Select.Item value={variant}>
                                  <Box
                                    style={{
                                      display: 'inline-block',
                                      width: '1em',
                                      height: '1em',
                                      verticalAlign: 'text-top',
                                      borderRadius: toRadiusVar('full'),
                                      backgroundColor: toColorVar({
                                        base: (state[key] as RadixColor).base,
                                        variant,
                                      }),
                                    }}
                                  />{' '}
                                  {variant}
                                </Select.Item>
                                <Select.Item value={`a${variant}`}>
                                  <Box
                                    style={{
                                      display: 'inline-block',
                                      overflow: 'hidden',
                                      width: '1em',
                                      height: '1em',
                                      verticalAlign: 'text-top',
                                      borderRadius: toRadiusVar('full'),
                                      backgroundColor: toColorVar({
                                        base: (state[key] as RadixColor).base,
                                        variant: `a${variant}`,
                                      }),
                                    }}
                                  >
                                    <Box
                                      style={{
                                        width: '50%',
                                        height: '100%',
                                        backgroundColor: toColorVar({
                                          base: (state[key] as RadixColor).base,
                                          variant,
                                        }),
                                      }}
                                    />
                                  </Box>{' '}
                                  {variant} translucent
                                </Select.Item>
                              </>
                            );
                          })}
                        </Select.Content>
                      </Select.Root>
                    </>
                  );
                  break;
                }

                case EmbedConfigType.TextColor: {
                  control = (
                    <Select.Root
                      value={`${state[key]}`}
                      onValueChange={(value) => {
                        mutateState((draft) => {
                          (draft[key] as RadixTextColor) =
                            value as RadixTextColor;
                        });
                      }}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value="undefined">
                          <Box
                            style={{
                              display: 'inline-block',
                              width: '1em',
                              height: '1em',
                              verticalAlign: 'text-top',
                              borderRadius: toRadiusVar('full'),
                              backgroundColor: 'white',
                            }}
                          />{' '}
                          White
                        </Select.Item>
                        <Select.Item value="gray">
                          <Box
                            style={{
                              display: 'inline-block',
                              width: '1em',
                              height: '1em',
                              verticalAlign: 'text-top',
                              borderRadius: toRadiusVar('full'),
                              backgroundColor: 'gray',
                            }}
                          />{' '}
                          Gray
                        </Select.Item>
                        {Object.entries(radixColors)
                          .filter(
                            ([key]) =>
                              !key.endsWith('A') &&
                              !key.endsWith('P3') &&
                              !key.endsWith('Dark') &&
                              !radixGrays.includes(key),
                          )
                          .map(([key]) => (
                            <Select.Item key={key} value={key}>
                              <Box
                                style={{
                                  display: 'inline-block',
                                  width: '1em',
                                  height: '1em',
                                  verticalAlign: 'text-top',
                                  borderRadius: toRadiusVar('full'),
                                  backgroundColor: toColorVar({
                                    base: key as RadixColorBase,
                                    variant: '9',
                                  }),
                                }}
                              />{' '}
                              {capitalize(key)}
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                  );
                  break;
                }
              }

              return (
                <Flex
                  direction="column"
                  gap="1"
                  mb="1"
                  pb={setting.pad ? '6' : undefined}
                >
                  <Text>{capitalize(startCase(key as string))}</Text>

                  {control && <Flex gap="1">{control}</Flex>}
                  {!control && <Text color="red">Immutable</Text>}
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
              {preview(state)}
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
