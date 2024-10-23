export function normalizeLeagueIcon(url: string) {
  return url.startsWith('http') ? url : `https:${url}`;
}
