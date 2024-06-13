import { PatreonAuthResponse } from '../../app/auth/[provider]/page';
import { mutateApp, useApp } from '../../stores/app';

export async function extendAuthPatreon() {
  const { patreon } = useApp.getState().logins;

  if (!patreon) return;

  const data = (await fetch(
    `/api/auth/patreon/refresh/${patreon.refreshToken}`,
  ).then((response) => response.json())) as PatreonAuthResponse;

  mutateApp((draft) => {
    draft.logins.patreon = {
      token: data.access_token,
      refreshToken: data.refresh_token,
      expires: Date.now() + data.expires_in * 1000,
    };
  });
}
