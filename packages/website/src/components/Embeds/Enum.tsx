import { Select } from '@radix-ui/themes';
import { useLocale } from '../../hooks/useLocale';
import type { EmbedPreviewControllerProps } from '../../pages/[...locale]/embed/[embed]/_index';
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
  const { locale } = useLocale();

  return (
    <Select.Root
      value={EmbedState.use((state) => state[configKey] as string)}
      onValueChange={(value) => {
        mutateEmbedState((draft) => {
          draft[configKey] = value;
        });
      }}
    >
      <Select.Trigger variant="classic" />

      <Select.Content>
        {config.options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.locales[locale]}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
