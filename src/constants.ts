import type { BlockType, ColorToken, Item } from './types';

export const GRID_COLS = 40;
export const GRID_ROWS = 20;
export const HEADER_HEIGHT = 48;
export const FOOTER_HEIGHT = 32;
export const MOBILE_BREAKPOINT = 768;

export const IS_OWNER = import.meta.env.DEV;

export const COLORS: { token: ColorToken; name: string; className: string; hex: string }[] = [
  { token: 0, name: 'warm amber', className: 'bg-block-amber', hex: '#fde3a7' },
  { token: 1, name: 'soft rose', className: 'bg-block-rose', hex: '#fac9d3' },
  { token: 2, name: 'sky blue', className: 'bg-block-blue', hex: '#c5dbf7' },
  { token: 3, name: 'mint', className: 'bg-block-green', hex: '#c9e6cf' },
  { token: 4, name: 'lavender', className: 'bg-block-purple', hex: '#d4c8f5' },
  { token: 5, name: 'stone', className: 'bg-block-stone', hex: '#ece5d3' },
];

export const BLOCK_DEFAULT_COLORS: Record<BlockType, ColorToken> = {
  h1: 0,
  h2: 0,
  h3: 0,
  p: 5,
  quote: 3,
  markdown: 5,
  code: 4,
  embed: 4,
  image: 1,
  link: 2,
};

export const CARD_SURFACES: Record<
  BlockType,
  { name: string; background: string; border: string; accent: string }
> = {
  h1: {
    name: 'display',
    background: 'var(--card-heading)',
    border: 'var(--card-heading-line)',
    accent: 'var(--card-heading-accent)',
  },
  h2: {
    name: 'display',
    background: 'var(--card-heading)',
    border: 'var(--card-heading-line)',
    accent: 'var(--card-heading-accent)',
  },
  h3: {
    name: 'display',
    background: 'var(--card-heading)',
    border: 'var(--card-heading-line)',
    accent: 'var(--card-heading-accent)',
  },
  p: {
    name: 'reading',
    background: 'var(--card-reading)',
    border: 'var(--card-reading-line)',
    accent: 'var(--card-reading-accent)',
  },
  markdown: {
    name: 'reading',
    background: 'var(--card-reading)',
    border: 'var(--card-reading-line)',
    accent: 'var(--card-reading-accent)',
  },
  quote: {
    name: 'quote',
    background: 'var(--card-quote)',
    border: 'var(--card-quote-line)',
    accent: 'var(--card-quote-accent)',
  },
  code: {
    name: 'code',
    background: 'var(--card-code)',
    border: 'var(--card-code-line)',
    accent: 'var(--card-code-accent)',
  },
  embed: {
    name: 'embed',
    background: 'var(--card-code)',
    border: 'var(--card-code-line)',
    accent: 'var(--card-code-accent)',
  },
  image: {
    name: 'media',
    background: 'var(--card-media)',
    border: 'var(--card-media-line)',
    accent: 'var(--card-media-accent)',
  },
  link: {
    name: 'navigation',
    background: 'var(--card-link)',
    border: 'var(--card-link-line)',
    accent: 'var(--card-link-accent)',
  },
};

export const BLOCK_TYPES: BlockType[] = [
  'h1',
  'h2',
  'h3',
  'p',
  'quote',
  'markdown',
  'code',
  'embed',
  'image',
  'link',
];

export const BLOCK_DEFAULTS: Record<BlockType, Pick<Item, 'cols' | 'rows' | 'label' | 'content'>> = {
  h1: { cols: 12, rows: 3, label: 'headline', content: 'Geometry' },
  h2: { cols: 10, rows: 2, label: 'section', content: 'A warm grid for loose thoughts' },
  h3: { cols: 8, rows: 2, label: 'note', content: 'Small heading' },
  p: {
    cols: 10,
    rows: 4,
    label: 'paragraph',
    content: 'Write directly into the canvas, move the block, and keep the published JSON small.',
  },
  quote: {
    cols: 10,
    rows: 4,
    label: 'quote',
    content: 'The grid is fixed; the composition can stay playful.',
  },
  markdown: { cols: 12, rows: 7, label: 'markdown', content: '/content/about.md' },
  code: {
    cols: 12,
    rows: 7,
    label: 'code',
    content: "export const cell = Math.min(width / 40, height / 20);\n",
  },
  embed: {
    cols: 12,
    rows: 8,
    label: 'embed',
    content:
      '<div style="font-family: Georgia, serif; padding: 24px; color: #2a2420">Embedded HTML</div>',
  },
  image: {
    cols: 10,
    rows: 7,
    label: 'image',
    content:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560"><rect width="800" height="560" fill="%23faf6ee"/><circle cx="280" cy="220" r="150" fill="%23fecdd3"/><circle cx="510" cy="310" r="170" fill="%23bfdbfe"/><path d="M130 410 C260 280 380 480 680 170" stroke="%23c8956c" stroke-width="42" fill="none" stroke-linecap="round"/></svg>',
  },
  link: { cols: 8, rows: 3, label: 'link', content: 'writing' },
};
