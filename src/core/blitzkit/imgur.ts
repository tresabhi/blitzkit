interface ImgurOptions {
  format: 'jpeg' | 'png';
}

const defaultImgurOptions: ImgurOptions = {
  format: 'png',
};

export function imgur(id: string, imgurOptions?: Partial<ImgurOptions>) {
  const options = { ...defaultImgurOptions, ...imgurOptions };

  return `https://i.imgur.com/${id}.${options.format}`;
}
