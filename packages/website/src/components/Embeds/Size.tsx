import { Slider } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState, type RadixSize } from '../../stores/embedState';

export function Size({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="classic"
      min={0}
      max={9}
      value={[
        EmbedState.use((state) => parseInt(state[configKey] as RadixSize)),
      ]}
      onValueChange={([value]) => {
        mutateEmbedState((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
