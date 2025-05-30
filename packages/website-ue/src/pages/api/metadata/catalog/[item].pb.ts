import type { APIRoute, GetStaticPaths, GetStaticPathsItem } from 'astro';
import { socketMetadata } from 'packages/website-ue/src/core/blitz/metadata.socket';

export const getStaticPaths: GetStaticPaths = () => {
  const paths: GetStaticPathsItem[] = [];

  for (const item in socketMetadata.items) {
    paths.push({ params: { item } });
  }

  return paths;
};

export const GET: APIRoute<{}, { item: string }> = async ({ params }) => {
  return new Response(
    await socketMetadata.get(params.item).then((item) => item.encode()),
    { headers: { 'Content-Type': 'application/octet-stream' } },
  );
};
