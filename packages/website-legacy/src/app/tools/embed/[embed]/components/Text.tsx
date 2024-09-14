import { TextField } from '@radix-ui/themes';
import * as EmbedState from '../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function Text({ configKey }: EmbedPreviewControllerProps) {
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
