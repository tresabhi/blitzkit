import { Slider as RadixSlider } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/tools/embed/[embed]/_index';
import { EmbedState, type RadixSize } from '../../stores/embedState';
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from '../../stores/embedState/constants';

export function Slider({
  configKey,
  config,
}: EmbedPreviewControllerProps & {
  config: EmbedConfigItemType<EmbedItemType.Slider>;
}) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <RadixSlider
      variant="classic"
      min={config.min}
      max={config.max}
      value={[
        EmbedState.use((state) => parseInt(state[configKey] as RadixSize)),
      ]}
      onValueChange={([value]) => {
        mutateEmbedState((draft) => {
          draft[configKey] = value;
        });
      }}
    />
  );
}
