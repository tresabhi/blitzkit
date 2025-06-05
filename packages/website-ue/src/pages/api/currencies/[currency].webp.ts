import { StuffUIComponent } from '@protos/blitz_static_stuff_ui_component';
import type { APIRoute, GetStaticPaths } from 'astro';
import { api } from 'packages/website-ue/src/core/blitzkit/api';

export const getStaticPaths: GetStaticPaths = () => {
  return api.metadata
    .filter((item) => item.startsWith('CurrencyEntity.'))
    .map((item) => ({
      params: { currency: item.undiscriminatedId() },
      props: { ui: item.get(StuffUIComponent, 'UIComponent') },
    }));
};

export const GET: APIRoute<{ ui: StuffUIComponent }> = async ({ props }) => {
  const response = await fetch(props.ui.icon);
  const buffer = await response.arrayBuffer();

  return new Response(buffer, { headers: response.headers });
};
