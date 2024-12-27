import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';
import { ColorControllerRaw } from './ColorControllerRaw';

export function Color({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();
  const color = EmbedState.use((state) => state[configKey] as string);

  return (
    <ColorControllerRaw
      value={color}
      onValueChange={(value) => {
        mutateEmbedState((draft) => {
          draft[configKey] = value;
        });
      }}
    />
  );
}
