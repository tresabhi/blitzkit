import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { TextField } from '@radix-ui/themes';
import { useRef } from 'react';
import { GalleryEphemeral } from '../../stores/galleryEphemeral';

export function GallerySearch() {
  const input = useRef<HTMLInputElement>(null);
  const mutateGalleryEphemeral = GalleryEphemeral.useMutation();

  return (
    <TextField.Root
      placeholder="Search avatars..."
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
