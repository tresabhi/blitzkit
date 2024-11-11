import { imgur, ShellType } from '@blitzkit/core';
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Select,
  Slider,
  Text,
  TextField,
} from '@radix-ui/themes';
import { invalidate } from '@react-three/fiber';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';

export function CustomShellButton() {
  const customShell = TankopediaEphemeral.use((state) => state.customShell);
  const antagonistShell = Duel.use((state) => state.antagonist.shell);
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const [customShellDraft, setCustomShellDraft] = useState(
    customShell ?? antagonistShell,
  );

  useEffect(() => {
    setCustomShellDraft(customShell ?? antagonistShell);
  }, [antagonistShell, customShell]);

  return (
    <Dialog.Root>
      <Dialog.Trigger>
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
      </Dialog.Trigger>

      <Dialog.Content>
        <Dialog.Title>Custom shell</Dialog.Title>

        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text>Type</Text>
            <Select.Root
              value={`${customShellDraft.type}`}
              onValueChange={(value) => {
                const type = Number(value) as ShellType;
                const modified = { ...customShellDraft, type };

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

                setCustomShellDraft(modified);
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

          <Flex align="center" justify="between">
            <Text>Caliber</Text>
            <TextField.Root
              style={{ maxWidth: '6rem' }}
              defaultValue={customShellDraft.caliber}
              type="number"
              onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                setCustomShellDraft({
                  ...customShellDraft,
                  caliber: event.target.valueAsNumber,
                });
              }}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  (event.target as HTMLInputElement).blur();
                } else if (event.key === 'Escape') {
                  (event.target as HTMLInputElement).valueAsNumber =
                    customShellDraft.caliber;
                  (event.target as HTMLInputElement).blur();
                }
              }}
            >
              <TextField.Slot side="right">mm</TextField.Slot>
            </TextField.Root>
          </Flex>

          <Flex align="center" justify="between">
            <Text>Penetration</Text>
            <TextField.Root
              style={{ maxWidth: '6rem' }}
              defaultValue={customShellDraft.penetration.near}
              type="number"
              onBlur={(event: ChangeEvent<HTMLInputElement>) => {
                setCustomShellDraft({
                  ...customShellDraft,
                  penetration: {
                    near: event.target.valueAsNumber,
                    far: event.target.valueAsNumber,
                  },
                });
              }}
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  (event.target as HTMLInputElement).blur();
                } else if (event.key === 'Escape') {
                  (event.target as HTMLInputElement).valueAsNumber =
                    customShellDraft.penetration.near;
                  (event.target as HTMLInputElement).blur();
                }
              }}
            >
              <TextField.Slot side="right">mm</TextField.Slot>
            </TextField.Root>
          </Flex>

          {(customShellDraft.type === ShellType.AP ||
            customShellDraft.type === ShellType.APCR) && (
            <>
              <Flex align="center" justify="between" gap="4" py="1">
                <Text>Normalization</Text>

                <Flex align="center" gap="2" flexGrow="1" maxWidth="15rem">
                  <Text color="gray">
                    {customShellDraft.normalization ?? 0}°
                  </Text>
                  <Slider
                    min={0}
                    max={90}
                    value={[customShellDraft.normalization ?? 0]}
                    onValueChange={([value]) =>
                      setCustomShellDraft({
                        ...customShellDraft,
                        normalization: value,
                      })
                    }
                  />
                </Flex>
              </Flex>

              <Flex align="center" justify="between" gap="4" py="1">
                <Text>Ricochet</Text>

                <Flex align="center" gap="2" flexGrow="1" maxWidth="15rem">
                  <Text color="gray">{customShellDraft.ricochet ?? 90}°</Text>
                  <Slider
                    min={0}
                    max={90}
                    value={[customShellDraft.ricochet ?? 90]}
                    onValueChange={([value]) =>
                      setCustomShellDraft({
                        ...customShellDraft,
                        ricochet: value,
                      })
                    }
                  />
                </Flex>
              </Flex>
            </>
          )}
        </Flex>

        <Flex justify="end" mt="6" gap="2">
          <Dialog.Close>
            <Button color="red" variant="outline">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            color="red"
            onClick={() => {
              setCustomShellDraft(antagonistShell);
            }}
          >
            Reset
          </Button>
          <Dialog.Close>
            <Button
              onClick={() => {
                invalidate();
                mutateTankopediaEphemeral((draft) => {
                  draft.shot = undefined;
                  draft.customShell = customShellDraft;
                });
              }}
            >
              Apply
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
