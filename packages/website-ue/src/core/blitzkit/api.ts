let base: string;

if (import.meta.env.DEV) {
  base = 'http://localhost:4321';
} else {
  base = import.meta.env.SITE;
}

export function api(path: string) {
  return `${base}/api/${path}`;
}
