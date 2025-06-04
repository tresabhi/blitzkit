import { ProfileAvatarComponent } from '@protos/blitz_static_profile_avatar_component';
import type { BlitzKitAvatar } from '@protos/blitzkit';
import type { APIRoute, GetStaticPaths } from 'astro';
import { api } from 'packages/website-ue/src/core/blitzkit/api';

export const getStaticPaths: GetStaticPaths = async () => {
  const { avatars } = await api.avatars();
  return avatars.map((avatar) => ({
    params: { id: avatar.id },
    props: { avatar },
  }));
};

export const GET: APIRoute<
  { avatar: BlitzKitAvatar },
  { id: string }
> = async ({ params }) => {
  const item = api.metadata.get(`ProfileAvatarEntity.${params.id}`);
  const avatar = item.get(ProfileAvatarComponent, 'profileAvatarComponent');

  try {
    const response = await fetch(avatar.avatar);
    const buffer = await response.arrayBuffer();

    return new Response(buffer, { headers: response.headers });
  } catch {
    return new Response(null, { status: 404 });
  }
};
