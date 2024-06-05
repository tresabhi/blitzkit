export enum ImgurSize {
  /**
   * The default size
   */
  Default = '',
  /**
   * Unknown size but really really small
   */
  UltraSmall = 'ss',
  /**
   * 90x90
   */
  SmallSquare = 's',
  /**
   * 160x160
   */
  BigSquare = 'b',
  /**
   * 160x160
   */
  SmallThumbnail = 't',
  /**
   * 320x320
   */
  MediumThumbnail = 'm',
  /**
   * 640x640
   */
  LargeThumbnail = 'l',
  /**
   * 1024x1024
   */
  HugeThumbnail = 'h',
}

interface ImgurOptions {
  format: 'jpeg' | 'png';
  size: ImgurSize;
}

const defaultImgurOptions: ImgurOptions = {
  format: 'png',
  size: ImgurSize.Default,
};

export function imgur(id: string, imgurOptions?: Partial<ImgurOptions>) {
  const options = { ...defaultImgurOptions, ...imgurOptions };

  return `https://i.imgur.com/${id}${options.size}.${options.format}`;
}
