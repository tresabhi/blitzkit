import { Slider } from '@radix-ui/themes';
import * as EmbedState from '../../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function Size({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="soft"
      min={0}
      max={9}
      value={[
        EmbedState.use((state) =>
          parseInt(state[configKey] as EmbedState.RadixSize),
        ),
      ]}
      onValueChange={([value]) => {
        mutateEmbedState((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
