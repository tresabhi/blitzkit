import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import type { APIRoute, GetStaticPaths, GetStaticPathsItem } from 'astro';
import { socketMetadata } from 'packages/website-ue/src/core/blitz/metadata.socket';

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: GetStaticPathsItem[] = [];

  for (const item in socketMetadata.items) {
    if (!item.startsWith('ProfileAvatarEntity.')) continue;

    const id = await socketMetadata
      .get(item)
      .then((item) => item.undiscriminatedId());

    paths.push({ params: { id } });
  }

  return paths;
};

export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  const item = await socketMetadata.get(`ProfileAvatarEntity.${params.id}`);
  const avatar = item.get(ProfileAvatarComponent, 'profileAvatarComponent');

  try {
    return await fetch(avatar.avatar);
  } catch {
    return new Response(null, { status: 404 });
  }
};
