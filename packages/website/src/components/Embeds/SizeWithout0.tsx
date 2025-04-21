import { Slider } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState, type RadixSizeWithout0 } from '../../stores/embedState';

export function SizeWithout0({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="classic"
      min={1}
      max={9}
      value={[
        EmbedState.use((state) =>
          parseInt(state[configKey] as RadixSizeWithout0),
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
