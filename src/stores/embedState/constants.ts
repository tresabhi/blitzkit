import { EmbedConfigItem } from '.';

export enum EmbedItemType {
  Number,
  Radius,
  Size,
  SizeWithout0,
  Color,
  String,
  RichText,
  Boolean,
  Slider,
}

export const radixGrays = [
  'gray',
  'mauve',
  'slate',
  'sage',
  'olive',
  'sand',
] as const;

export const radixTextWeights = ['light', 'regular', 'medium', 'bold'] as const;

export type EmbedConfigItemType<Type extends EmbedItemType> =
  EmbedConfigItem & { type: Type };
