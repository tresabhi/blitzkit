import { Switch } from '@radix-ui/themes';
import * as EmbedState from '../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function Boolean({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Switch
      variant="soft"
      checked={EmbedState.use((state) => state[configKey] as boolean)}
      onCheckedChange={() => {
        mutateEmbedState((draft) => {
          draft[configKey] = !draft[configKey];
        });
      }}
    />
  );
}
