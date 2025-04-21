import { Switch } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';

export function Boolean({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Switch
      variant="classic"
      checked={EmbedState.use((state) => state[configKey] as boolean)}
      onCheckedChange={() => {
        mutateEmbedState((draft) => {
          draft[configKey] = !draft[configKey];
        });
      }}
    />
  );
}
