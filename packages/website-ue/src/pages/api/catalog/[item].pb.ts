import type { APIRoute, GetStaticPaths, GetStaticPathsItem } from 'astro';
import { catalog } from 'packages/website-ue/src/core/blitz/catalog';

export const getStaticPaths: GetStaticPaths = () => {
  const paths: GetStaticPathsItem[] = [];

  for (const item in catalog.items) {
    paths.push({ params: { item } });
  }

  return paths;
};

export const GET: APIRoute<{}, { item: string }> = ({ params }) => {
  return new Response(catalog.get(params.item).encode(), {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
};
