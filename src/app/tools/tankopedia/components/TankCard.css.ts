import { createVar, style } from '@vanilla-extract/css';

export const cardBackgroundVar = createVar();

export const card = style({
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-2)',
  background: cardBackgroundVar,
});

export const image = style({
  height: 64,
  width: '100%',
  objectPosition: 'center right',
  objectFit: 'contain',
});

export const classIcon = style({
  width: '1em',
  height: '1em',
  minWidth: '1em',
  minHeight: '1em',
});

export const name = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});
