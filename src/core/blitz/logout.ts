import { mutateApp } from '../../stores/app';

export function logout() {
  mutateApp((draft) => {
    draft.login = undefined;
  });
}
