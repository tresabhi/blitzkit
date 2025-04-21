import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useRef } from 'react';
import { useLocale } from '../../hooks/useLocale';
import { GalleryEphemeral } from '../../stores/galleryEphemeral';
import type { MaybeSkeletonComponentProps } from '../../types/maybeSkeletonComponentProps';

export function GallerySearch({ skeleton }: MaybeSkeletonComponentProps) {
  const input = useRef<HTMLInputElement>(null);
  const mutateGalleryEphemeral = GalleryEphemeral.useMutation();
  const { strings } = useLocale();

  return (
    <TextField.Root
      disabled={skeleton}
      placeholder={strings.website.tools.gallery.search.hint}
      ref={input}
      onChange={(event) => {
        mutateGalleryEphemeral((draft) => {
          const trimmed = event.target.value.trim();
          draft.search = trimmed.length === 0 ? undefined : trimmed;
        });
      }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>
    </TextField.Root>
  );
}
