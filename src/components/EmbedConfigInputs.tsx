import * as radixColors from '@radix-ui/colors';
import {
  BorderSolidIcon,
  Cross1Icon,
  ImageIcon,
  SquareIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Inset,
  ScrollArea,
  Select,
  Separator,
  Switch,
  Text,
  TextField,
} from '@radix-ui/themes';
import { produce } from 'immer';
import { capitalize, clamp, startCase, times } from 'lodash';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
import { toColorVar, toRadiusVar } from '../app/tools/embed/utilities';
import { imgur } from '../core/blitzkit/imgur';
import { NAVBAR_HEIGHT } from './Navbar';
import PageWrapper from './PageWrapper';

interface EmbedConfigInputsProps {
  config: EmbedConfig;
  state: ExtractEmbedConfigType<EmbedConfig>;
  setState: Dispatch<SetStateAction<ExtractEmbedConfigType<EmbedConfig>>>;
  children: ReactNode;
}

export function EmbedConfigInputs({
  config,
  state,
  setState,
  children,
}: EmbedConfigInputsProps) {
  const [backgroundImage, setBackgroundImage] = useState(imgur('SO13zur'));
  const mutateState = useCallback(
    (recipe: (draft: ExtractEmbedConfigType<EmbedConfig>) => void) => {
      setState(produce(recipe));
    },
    [],
  );
  const wrapper = useRef<HTMLDivElement>(null);
  const handlePointerMove = useCallback((event: PointerEvent) => {
    event.preventDefault();

    if (!wrapper.current) return;

    wrapper.current.style.top = `${clamp(parseFloat(wrapper.current.style.top) + event.movementY, 32, window.innerHeight - 32 - 32)}px`;
    wrapper.current.style.right = `${clamp(parseFloat(wrapper.current.style.right) - event.movementX, 32, window.innerWidth - 32 - 320)}px`;
  }, []);
  const handlePointerUp = useCallback(() => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, []);
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

            <Button
              variant="outline"
              color="gray"
              mb="6"
              onClick={() => fileInput.current?.click()}
            >
              <ImageIcon /> Upload test background
            </Button>

            {Object.entries(config).map(([key, setting]) => {
              let control: ReactNode;

              switch (setting.type) {
                case EmbedConfigType.Boolean: {
                  control = (
                    <Switch
                      checked={state[key] as boolean}
                      onCheckedChange={(checked) =>
                        mutateState((draft) => {
                          draft[key] = checked;
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
                        value={`${(state[key] as EmbedConfigItemType<EmbedConfigType.FullTextControl>).color}`}
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>
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
                            ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>
                          ).size
                        }
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>
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
                            ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>
                          ).weight
                        }
                        onValueChange={(value) => {
                          mutateState((draft) => {
                            (
                              draft[
                                key
                              ] as EmbedConfigItemType<EmbedConfigType.FullTextControl>
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
                          draft[key] = (
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
                          draft[key] = (event.target as HTMLInputElement).value;
                        });
                      }}
                    />
                  );
                  break;
                }

                case EmbedConfigType.SizeNo0:
                case EmbedConfigType.Size: {
                  control = (
                    <Select.Root
                      value={state[key] as RadixSize}
                      onValueChange={(value) => {
                        mutateState((draft) => {
                          draft[key] = value as RadixSize;
                        });
                      }}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {times(10, (index) =>
                          setting.type === EmbedConfigType.SizeNo0 &&
                          index === 0 ? null : (
                            <Select.Item key={index} value={`${index}`}>
                              {index}
                            </Select.Item>
                          ),
                        )}
                      </Select.Content>
                    </Select.Root>
                  );
                  break;
                }

                case EmbedConfigType.Radius: {
                  control = (
                    <Select.Root
                      value={state[key] as RadixRadius}
                      onValueChange={(value) => {
                        mutateState((draft) => {
                          draft[key] = value as RadixRadius;
                        });
                      }}
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {times(5, (index) => (
                          <Select.Item key={index} value={`${index}`}>
                            {index}
                          </Select.Item>
                        ))}
                        <Select.Item value="full">Full</Select.Item>
                      </Select.Content>
                    </Select.Root>
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
                                <Select.Item key={key} value={variant}>
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
                                <Select.Item key={key} value={`a${variant}`}>
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
                          draft[key] = value as RadixTextColor;
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
                  <Flex align="center" gap="4">
                    <Text>{capitalize(startCase(key))}</Text>

                    <Separator style={{ flex: 1 }} />
                  </Flex>

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
          <Card style={{ height: '100%' }}>
            <Flex direction="column" gap="2" height="100%">
              <Inset style={{ borderRadius: 0 }}>
                <Flex
                  justify="between"
                  p="2"
                  px="3"
                  style={{
                    backgroundColor: 'var(--color-panel-translucent)',
                  }}
                >
                  <Text color="gray">Streaming software</Text>

                  <Flex align="center" gap="3">
                    <IconButton color="gray" disabled size="1" variant="ghost">
                      <BorderSolidIcon />
                    </IconButton>
                    <IconButton color="gray" disabled size="1" variant="ghost">
                      <SquareIcon />
                    </IconButton>
                    <IconButton color="gray" disabled size="1" variant="ghost">
                      <Cross1Icon />
                    </IconButton>
                  </Flex>
                </Flex>
              </Inset>

              <Flex
                mt="4"
                flexGrow="1"
                style={{
                  borderRadius: toRadiusVar('3'),
                  overflow: 'hidden',
                  background: `url(${backgroundImage}) center / cover no-repeat`,
                }}
                align="center"
                justify="center"
              >
                {children}
              </Flex>
            </Flex>
          </Card>
        </Box>
      </Flex>
    </PageWrapper>
  );
}
