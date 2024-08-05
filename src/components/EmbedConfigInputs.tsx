import { Flex, Select, Text, TextField } from '@radix-ui/themes';
import { produce } from 'immer';
import { capitalize, startCase, times } from 'lodash';
import { Dispatch, SetStateAction, useCallback } from 'react';
import {
  EmbedConfig,
  EmbedConfigType,
  ExtractEmbedConfigType,
  RadixRadius,
  RadixSize,
} from '../app/tools/embed/types';

interface EmbedConfigInputsProps {
  config: EmbedConfig;
  state: ExtractEmbedConfigType<EmbedConfig>;
  setState: Dispatch<SetStateAction<ExtractEmbedConfigType<EmbedConfig>>>;
}

export function EmbedConfigInputs({
  config,
  state,
  setState,
}: EmbedConfigInputsProps) {
  const mutateState = useCallback(
    (recipe: (draft: ExtractEmbedConfigType<EmbedConfig>) => void) => {
      setState(produce(recipe));
    },
    [],
  );

  return (
    <Flex direction="column" gap="2" align="end">
      {Object.entries(config).map(([key, setting]) => {
        const name = capitalize(startCase(key));

        switch (setting.type) {
          case EmbedConfigType.Number: {
            return (
              <Flex align="center" gap="2">
                <Text>{name}</Text>
                <TextField.Root
                  style={{ width: 96 }}
                  type="number"
                  value={state[key]}
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
              </Flex>
            );
          }

          case EmbedConfigType.Size: {
            return (
              <Flex align="center" gap="2">
                <Text>{name}</Text>
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
                    {times(10, (index) => (
                      <Select.Item key={index} value={`${index}`}>
                        {index}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            );
          }

          case EmbedConfigType.Radius: {
            return (
              <Flex align="center" gap="2">
                <Text>Card radius</Text>
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
              </Flex>
            );
          }
        }
      })}
    </Flex>
  );
}
