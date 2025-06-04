import { BlitzKitAvatars } from '@protos/blitzkit';
import type { APIRoute } from 'astro';
import { api } from 'packages/website-ue/src/core/blitzkit/api';

export const GET: APIRoute = async () => {
  return new Response(BlitzKitAvatars.encode(await api.avatars()).finish());
};
