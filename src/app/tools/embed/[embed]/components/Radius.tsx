import { Slider } from '@radix-ui/themes';
import * as EmbedState from '../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function Radius({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Slider
      variant="soft"
      min={0}
      max={5}
      value={[
        EmbedState.use((state) => {
          const radius = state[configKey] as EmbedState.RadixRadius;
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
