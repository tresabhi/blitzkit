import { Slider } from '@radix-ui/themes';
import * as EmbedState from '../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function SizeWithout0({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="soft"
      min={1}
      max={9}
      value={[
        EmbedState.use((state) =>
          parseInt(state[configKey] as EmbedState.RadixSizeWithout0),
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
