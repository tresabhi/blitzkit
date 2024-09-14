import * as EmbedState from '../../../../../stores/embedState';
import {
  EmbedConfigItemType,
  EmbedItemType,
} from '../../../../../stores/embedState/constants';
import { EmbedPreviewControllerProps } from '../page';
import { ColorControllerRaw } from './Color/components/ColorControllerRaw';

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
