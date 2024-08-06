import * as radixColors from '@radix-ui/colors';
import {
  DragHandleDots2Icon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  ImageIcon,
} from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Card,
  Flex,
  IconButton,
  Inset,
  ScrollArea,
  Select,
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
  const [expanded, setExpanded] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(
    'https://upload.wikimedia.org/wikipedia/commons/f/f6/Swiss_National_Park_131.JPG',
  );
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
    <Flex
      width="100vw"
      height="100vh"
      align="center"
      justify="center"
      overflow="hidden"
      style={{
        background: `url(${backgroundImage}) center / cover no-repeat`,
      }}
    >
      <Card
        style={{ position: 'fixed', top: 32, right: 32, minWidth: 320 }}
        ref={wrapper}
      >
        <Inset mb="4">
          <Flex
            align="center"
            justify="center"
            p="2"
            mb={expanded ? '2' : '0'}
            position="relative"
            style={{
              backgroundColor: 'var(--color-panel-translucent)',
              cursor: 'grab',
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              window.addEventListener('pointermove', handlePointerMove);
              window.addEventListener('pointerup', handlePointerUp);
            }}
          >
            <Text color="gray" trim="end">
              <DragHandleDots2Icon style={{ transform: 'rotate(90deg)' }} />
            </Text>

            <Box
              position="absolute"
              right="0"
              top="50%"
              pr="2"
              style={{ transform: 'translateY(-25%)' }}
            >
              <IconButton
                variant="ghost"
                color="gray"
                onClick={() => setExpanded((expanded) => !expanded)}
              >
                {expanded ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
              </IconButton>
            </Box>
          </Flex>
        </Inset>

        {expanded && (
          <ScrollArea
            scrollbars="vertical"
            style={{ height: '100%', maxHeight: 640 }}
          >
            <Flex direction="column" gap="2">
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
                          size="1"
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
                          size="1"
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
                          size="1"
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
                        size="1"
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
                        size="1"
                        style={{ width: 64 }}
                        value={state[key] as string}
                        onChange={(event) => {
                          mutateState((draft) => {
                            draft[key] = (
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
                      <Select.Root
                        size="1"
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
                        size="1"
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
                          size="1"
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
                          size="1"
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
                                            base: (state[key] as RadixColor)
                                              .base,
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
                        size="1"
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
                    <Text color="gray" size="2">
                      {capitalize(startCase(key))}
                    </Text>
                    {control && <Flex gap="1">{control}</Flex>}
                    {!control && (
                      <Text color="red" size="1">
                        Immutable
                      </Text>
                    )}
                  </Flex>
                );
              })}
            </Flex>
          </ScrollArea>
        )}

        {!expanded && (
          <Flex justify="center">
            <Text size="2" color="gray">
              Expand to configure
            </Text>
          </Flex>
        )}
      </Card>

      {children}
    </Flex>
  );
}
