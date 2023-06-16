export interface PSAData {
  title: string;
  description: string;
}

export interface PSA {
  data?: PSAData;
}

export const psa: PSA = {};

console.log('Caching PSA...');
fetch(
  'https://gist.githubusercontent.com/tresabhi/ed4b136f08856e615212e573aabe1968/raw',
)
  .then((response) => response.json())
  .then((data) => {
    psa.data = data as PSAData;
    console.log('PSA cached');
  });
