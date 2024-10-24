export type BlitzGlossary = Record<
  string,
  {
    count: number;
    title: string;
    image_url: null | string;
    sizes: Record<BlitzGlossarySizes, string>;
    type: BlitzGlossaryType;
  }
>;

type BlitzGlossaryType = 'currency' | 'stuff' | 'achievement' | 'camouflage';
type BlitzGlossarySizes = '64x64';
