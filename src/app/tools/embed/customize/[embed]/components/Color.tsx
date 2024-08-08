import { Slider } from '@radix-ui/themes';
import { useRef } from 'react';
import * as EmbedState from '../../../../../../stores/embedState';
import { EmbedPreviewControllerProps } from '../page';

export function Color({ configKey }: EmbedPreviewControllerProps) {
  const mutateEmbedState = EmbedState.useMutation();
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={input}
        type="color"
        value={EmbedState.use((state) =>
          (state[configKey] as string).slice(0, 7),
        )}
        onChange={(event) => {
          mutateEmbedState((draft) => {
            let alpha = (draft[configKey] as string).slice(7, 9);
            if (alpha.length === 0) alpha = 'ff';
            draft[configKey] = `${event.target.value}${alpha}`;
          });
        }}
      />
      <Slider
        min={0}
        max={255}
        value={[
          EmbedState.use((state) => {
            let alpha = (state[configKey] as string).slice(7, 9);
            if (alpha.length === 0) return 255;
            return parseInt(alpha, 16);
          }),
        ]}
        onValueChange={([value]) => {
          mutateEmbedState((draft) => {
            if (!input.current) return;

            const color = input.current.value;
            draft[configKey] = `${color}${value.toString(16)}`;
          });
        }}
      />
    </>
  );
}
