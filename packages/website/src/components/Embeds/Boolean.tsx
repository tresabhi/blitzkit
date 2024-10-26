import { Switch } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';

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
