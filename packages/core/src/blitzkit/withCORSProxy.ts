import { context } from '@blitzkit/core';

export function withCORSProxy(url: string) {
  return context === 'website'
    ? `https://corsproxy.io/?${encodeURIComponent(url)}`
    : url;
}
