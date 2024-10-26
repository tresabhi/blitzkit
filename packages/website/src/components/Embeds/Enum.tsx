import { Select } from '@radix-ui/themes';
import type { EmbedPreviewControllerProps } from '../../pages/tools/embed/[embed]/_index';
import { EmbedState } from '../../stores/embedState';
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from '../../stores/embedState/constants';

export function Enum({
  configKey,
  config,
}: EmbedPreviewControllerProps & {
  config: EmbedConfigItemType<EmbedItemType.Enum>;
}) {
  const mutateEmbedState = EmbedState.useMutation();

  return (
    <Select.Root
      value={EmbedState.use((state) => state[configKey] as string)}
      onValueChange={(value) => {
        mutateEmbedState((draft) => {
          draft[configKey] = value;
        });
      }}
    >
      <Select.Trigger />
      <Select.Content>
        {config.options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
