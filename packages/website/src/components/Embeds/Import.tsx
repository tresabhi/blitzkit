import {
  AlertDialog,
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { EmbedState } from '../../stores/embedState';

export function Import() {
  const importInput = useRef<HTMLInputElement>(null);
  const [showInvalidURLPrompt, setShowInvalidURLPrompt] = useState(false);
  const [showConfirmation, setConfirmation] = useState(false);
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <>
      <Heading>Import</Heading>
      <Text size="2" color="gray" mb="2">
        Paste your current URL if you have one already to import your settings
      </Text>

      <AlertDialog.Root
        open={showInvalidURLPrompt}
        onOpenChange={setShowInvalidURLPrompt}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Invalid URL</AlertDialog.Title>
          <AlertDialog.Description>
            Try pasting the URL that BlitzKit previously generated, you silly
            goose!
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button>Okay, my bad</Button>
            </AlertDialog.Cancel>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Flex gap="2" mb="6">
        <TextField.Root
          ref={importInput}
          placeholder="Paste URL..."
          style={{ flex: 1 }}
        />
        <Tooltip content="Applied!" open={showConfirmation}>
          <Button
            onClick={() => {
              if (!importInput.current) return;

              try {
                const url = new URL(importInput.current.value);
                const state = url.searchParams.get('state');
                if (state === null) throw undefined;
                const json = JSON.parse(state);

                mutateEmbedState((draft) => {
                  Object.assign(draft, json);
                });

                importInput.current.value = '';
                setConfirmation(true);
                setTimeout(() => setConfirmation(false), 2000);
              } catch {
                setShowInvalidURLPrompt(true);
              }
            }}
          >
            Apply
          </Button>
        </Tooltip>
      </Flex>
    </>
  );
}
