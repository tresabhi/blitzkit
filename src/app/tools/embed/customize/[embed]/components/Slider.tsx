import { Slider as RadixSlider } from '@radix-ui/themes';
import * as EmbedState from '../../../../../../stores/embedState';
import {
  EmbedConfigItemType,
  EmbedItemType,
} from '../../../../../../stores/embedState/constants';
import { EmbedPreviewControllerProps } from '../page';

export function Slider({
  configKey,
  config,
}: EmbedPreviewControllerProps & {
  config: EmbedConfigItemType<EmbedItemType.Slider>;
}) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <RadixSlider
      variant="soft"
      min={config.min}
      max={config.max}
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
