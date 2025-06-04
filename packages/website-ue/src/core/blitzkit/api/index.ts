import type { BlitzkitAPI } from 'packages/core/src';

let api: BlitzkitAPI;

if (import.meta.env.SSR) {
  api = await import('./server').then((module) => module.api);
} else {
  api = await import('./client').then((module) => module.api);
}

export { api };
