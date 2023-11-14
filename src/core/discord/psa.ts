export type PSAData = {
  secret?: boolean;
  links?: {
    title: string;
    url: string;
  }[];
} & (
  | {
      type: 'image';
      image: string;
      title?: string;
    }
  | {
      type: 'embed';
      title: string;
      description: string;
    }
);

export interface PSA {
  data: PSAData | null;
}

export const psa: PSA = {
  data: null,
};

fetch(
  'https://gist.githubusercontent.com/tresabhi/ed4b136f08856e615212e573aabe1968/raw',
)
  .then((response) => response.json())
  .then((data) => {
    psa.data = data as PSAData;
  });
