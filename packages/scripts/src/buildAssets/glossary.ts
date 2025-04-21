import { Avatar, encodePBBuffer, fetchGlossary, Gallery } from '@blitzkit/core';
import locales from '@blitzkit/i18n/locales.json';
import { extname } from 'path';
import ProgressBar from 'progress';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';

export async function glossary() {
  console.log('Building glossary...');

  const avatars: Record<string, { avatar: Avatar; url: string }> = {};

  await Promise.all(
    locales.supported.map(async (supported) => {
      const glossary = await fetchGlossary(supported.blitz ?? supported.locale);

      console.log(
        `Found ${Object.keys(glossary).length} things for ${supported.locale}`,
      );

      for (const key in glossary) {
        const glossaryEntry = glossary[key];

        if (
          !key.startsWith('avatar') ||
          key.endsWith('_part') ||
          glossaryEntry.image_url === null
        ) {
          continue;
        }

        if (key in avatars) {
          avatars[key].avatar.name.locales[supported.locale] =
            glossaryEntry.title;
        } else {
          const extension = extname(glossaryEntry.image_url);

          avatars[key] = {
            url: glossaryEntry.image_url,
            avatar: {
              id: key,
              name: { locales: { [supported.locale]: glossaryEntry.title } },
              extension,
            },
          };
        }
      }
    }),
  );

  const changes: FileChange[] = [];
  const gallery: Gallery = { avatars: [] };
  const totalCount = Object.keys(avatars).length;

  const bar = new ProgressBar(
    `Fetching avatars of ${totalCount} things :bar`,
    totalCount,
  );

  await Promise.all(
    Object.entries(avatars).map(async ([key, { url, avatar }]) => {
      if (!(locales.default in avatars[key].avatar.name.locales)) {
        console.warn(`Avatar ${key} has no ${locales.default} name`);
        bar.tick();

        return;
      }

      gallery.avatars.push(avatar);

      const content = await fetch(url).then((response) =>
        response.arrayBuffer(),
      );

      changes.push({
        path: `gallery/avatars/${key}${avatar.extension}`,
        content: Buffer.from(content),
      });

      bar.tick();
    }),
  );

  changes.push({
    path: 'definitions/gallery.pb',
    content: encodePBBuffer(Gallery, gallery),
  });

  await commitAssets('glossary', changes);
}
