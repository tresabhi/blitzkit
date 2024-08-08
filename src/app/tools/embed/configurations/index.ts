import { ReactNode } from 'react';
import { EmbedConfig } from '../../../../stores/embedState';
import { BreakdownPreview, breakdownConfig } from './breakdown';

export const configurations = {
  breakdown: breakdownConfig,
} satisfies Record<string, EmbedConfig>;

export const previews = {
  breakdown: BreakdownPreview,
} satisfies Record<string, () => ReactNode>;
