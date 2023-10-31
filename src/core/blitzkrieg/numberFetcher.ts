import { Fetcher } from 'swr';

export const numberFetcher: Fetcher<number, string> = (url) =>
  fetch(url)
    .then((res) => res.text())
    .then(parseInt);
