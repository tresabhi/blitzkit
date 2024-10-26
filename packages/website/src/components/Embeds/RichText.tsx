import type { EmbedPreviewControllerProps } from '../../pages/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from '../../stores/embedState/constants';
import { ColorControllerRaw } from './ColorControllerRaw';

export function RichText({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();
  const state = EmbedState.use(
    (state) =>
      state[
        configKey
      ] as EmbedConfigItemType<EmbedItemType.RichText>['default'],
  );

  return (
    <ColorControllerRaw
      value={state.color}
      onValueChange={(value) => {
        mutateEmbedState((draft) => {
          (
            draft[
              configKey
            ] as EmbedConfigItemType<EmbedItemType.RichText>['default']
          ).color = value;
        });
      }}
    />
  );
}
