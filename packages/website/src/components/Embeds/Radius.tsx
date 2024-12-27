import { Slider } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState, type RadixRadius } from '../../stores/embedState';

export function Radius({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="soft"
      min={0}
      max={5}
      value={[
        EmbedState.use((state) => {
          const radius = state[configKey] as RadixRadius;
          return radius === 'full' ? 5 : parseInt(radius);
        }),
      ]}
      onValueChange={([value]) => {
        mutateEmbedState((draft) => {
          draft[configKey] = value === 5 ? 'full' : `${value}`;
        });
      }}
    />
  );
}
