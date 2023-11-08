import { context } from './context';

export function withCORSProxy(url: string) {
  return context === 'website'
    ? `https://corsproxy.io/?${encodeURIComponent(url)}`
    : url;

  // `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}
