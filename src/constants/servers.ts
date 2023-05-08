export const BLITZ_SERVERS = {
  com: 'North America',
  eu: 'Europe',
  asia: 'Asia',
};

export const BLITZ_SERVERS_SHORT = {
  com: 'NA',
  eu: 'EU',
  asia: 'ASIA',
};

export const BLITZ_SERVERS_SHORT_INVERSE = {
  NA: 'com',
  EU: 'eu',
  ASIA: 'asia',
};

export type BlitzServer = keyof typeof BLITZ_SERVERS;
