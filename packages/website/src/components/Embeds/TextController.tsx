import { TextField } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';

export function TextController({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <TextField.Root
      placeholder="Empty"
      value={EmbedState.use((state) => state[configKey] as string)}
      onChange={(event) => {
        mutateEmbedState((draft) => {
          draft[configKey] = event.target.value;
        });
      }}
    />
  );
}
