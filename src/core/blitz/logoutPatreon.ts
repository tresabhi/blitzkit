import { mutateApp } from '../../stores/app';

export function logoutPatreon() {
  mutateApp((draft) => {
    draft.logins.patreon = undefined;
  });
}
