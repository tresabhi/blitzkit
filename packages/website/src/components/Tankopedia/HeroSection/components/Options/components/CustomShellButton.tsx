import { imgur, ShellType } from '@blitzkit/core';
import {
  Button,
  Flex,
  IconButton,
  Popover,
  Select,
  Slider,
  Text,
  TextField,
} from '@radix-ui/themes';
import { throttle } from 'lodash-es';
import { type ChangeEvent } from 'react';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';

export function CustomShellButton() {
  const customShell = TankopediaEphemeral.use((state) => state.customShell);
  const antagonistShell = Duel.use((state) => state.antagonist.shell);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open) return;

        mutateTankopediaEphemeral((draft) => {
          draft.customShell = antagonistShell;
        });
      }}
    >
      <Popover.Trigger>
        <IconButton
          color={customShell ? undefined : 'gray'}
          variant="soft"
          size={{ initial: '2', sm: '3' }}
          radius="none"
        >
          <img
            alt="custom shell"
            src={imgur('j2CoXak')}
            style={{
              width: '50%',
              height: '50%',
            }}
          />
        </IconButton>
      </Popover.Trigger>

      <Popover.Content>
        {/* <Popover.Title>Custom shell</Popover.Title> */}

        {customShell && (
          <>
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between" gap="4">
                <Text>Type</Text>
                <Select.Root
                  value={`${customShell.type}`}
                  onValueChange={(value) => {
                    const type = Number(value) as ShellType;
                    const modified = { ...customShell, type };

                    switch (type) {
                      case ShellType.AP: {
                        modified.normalization = 5;
                        modified.ricochet = 70;
                        break;
                      }
                      case ShellType.APCR: {
                        modified.normalization = 2;
                        modified.ricochet = 70;
                        break;
                      }
                      case ShellType.HEAT:
                      case ShellType.HE: {
                        modified.normalization = undefined;
                        modified.ricochet = undefined;
                        break;
                      }
                    }

                    mutateTankopediaEphemeral((draft) => {
                      draft.customShell = modified;
                    });
                  }}
                >
                  <Select.Trigger />

                  <Select.Content>
                    <Select.Item value={`${ShellType.AP}`}>AP</Select.Item>
                    <Select.Item value={`${ShellType.APCR}`}>APCR</Select.Item>
                    <Select.Item value={`${ShellType.HEAT}`}>HEAT</Select.Item>
                    <Select.Item value={`${ShellType.HE}`}>HE</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              <Flex align="center" justify="between" gap="4">
                <Text>Caliber</Text>
                <TextField.Root
                  style={{ maxWidth: '6rem' }}
                  defaultValue={customShell.caliber}
                  type="number"
                  onChange={(event) => {
                    mutateTankopediaEphemeral((draft) => {
                      draft.customShell!.caliber = event.target.valueAsNumber;
                    });
                  }}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      (event.target as HTMLInputElement).blur();
                    } else if (event.key === 'Escape') {
                      (event.target as HTMLInputElement).valueAsNumber =
                        customShell.caliber;
                      (event.target as HTMLInputElement).blur();
                    }
                  }}
                >
                  <TextField.Slot side="right">mm</TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex align="center" justify="between" gap="4">
                <Text>Penetration</Text>
                <TextField.Root
                  style={{ maxWidth: '6rem' }}
                  defaultValue={customShell.penetration.near}
                  type="number"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    mutateTankopediaEphemeral((draft) => {
                      draft.customShell!.penetration.near =
                        event.target.valueAsNumber;
                    });
                  }}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      (event.target as HTMLInputElement).blur();
                    } else if (event.key === 'Escape') {
                      (event.target as HTMLInputElement).valueAsNumber =
                        customShell.penetration.near;
                      (event.target as HTMLInputElement).blur();
                    }
                  }}
                >
                  <TextField.Slot side="right">mm</TextField.Slot>
                </TextField.Root>
              </Flex>

              {(customShell.type === ShellType.AP ||
                customShell.type === ShellType.APCR) && (
                <>
                  <Flex align="center" justify="between" gap="4" py="1">
                    <Text>Normalization</Text>

                    <Flex
                      align="center"
                      gap="2"
                      flexGrow="1"
                      maxWidth="15rem"
                      minWidth="8rem"
                    >
                      <Text color="gray">
                        {customShell.normalization ?? 0}°
                      </Text>
                      <Slider
                        min={0}
                        max={90}
                        value={[customShell.normalization ?? 0]}
                        onValueChange={throttle(([value]) => {
                          console.log('asd');

                          mutateTankopediaEphemeral((draft) => {
                            draft.customShell!.normalization = value;
                          });
                        }, 1000)}
                      />
                    </Flex>
                  </Flex>

                  <Flex align="center" justify="between" gap="4" py="1">
                    <Text>Ricochet</Text>

                    <Flex align="center" gap="2" flexGrow="1" maxWidth="15rem">
                      <Text color="gray">{customShell.ricochet ?? 90}°</Text>
                      <Slider
                        min={0}
                        max={90}
                        value={[customShell.ricochet ?? 90]}
                        onValueChange={throttle(([value]) => {
                          mutateTankopediaEphemeral((draft) => {
                            draft.customShell!.ricochet = value;
                          });
                        }, 1000)}
                      />
                    </Flex>
                  </Flex>
                </>
              )}
            </Flex>

            <Flex justify="end" mt="6" gap="2">
              <Popover.Close>
                <Button color="red" variant="outline">
                  Exit
                </Button>
              </Popover.Close>
              <Button
                color="red"
                onClick={() => {
                  mutateTankopediaEphemeral((draft) => {
                    draft.customShell = antagonistShell;
                  });
                }}
              >
                Reset
              </Button>
            </Flex>
          </>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
