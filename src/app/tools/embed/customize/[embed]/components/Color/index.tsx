import * as EmbedState from '../../../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../../page';
import { ColorControllerRaw } from './components/ColorControllerRaw';

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
