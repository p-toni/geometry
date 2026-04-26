import type { BlockType, ColorToken, Item } from './types';

export const GRID_COLS = 40;
export const GRID_ROWS = 20;
export const HEADER_HEIGHT = 48;
export const FOOTER_HEIGHT = 32;
export const MOBILE_BREAKPOINT = 768;

export const IS_OWNER = import.meta.env.DEV;

export const COLORS: { token: ColorToken; name: string; className: string; hex: string }[] = [
  { token: 0, name: 'pale cashmere', className: 'bg-block-amber', hex: '#e8dfd5' },
  { token: 1, name: 'cinnamon ice', className: 'bg-block-rose', hex: '#dbbba7' },
  { token: 2, name: 'burning orange', className: 'bg-block-blue', hex: '#ff7124' },
  { token: 3, name: 'blue estate', className: 'bg-block-green', hex: '#3b4883' },
  { token: 4, name: 'wahoo', className: 'bg-block-purple', hex: '#272d4e' },
  { token: 5, name: 'noble black', className: 'bg-block-stone', hex: '#202124' },
];

export const BLOCK_DEFAULT_COLORS: Record<BlockType, ColorToken> = {
  h1: 3,
  h2: 3,
  h3: 3,
  p: 1,
  quote: 1,
  markdown: 5,
  code: 4,
  embed: 3,
  image: 0,
  link: 2,
  shader: 5,
  voxel: 0,
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
  shader: {
    name: 'shader',
    background: 'var(--card-code)',
    border: 'var(--card-code-line)',
    accent: 'var(--card-code-accent)',
  },
  voxel: {
    name: 'voxel',
    background: 'var(--card-media)',
    border: 'var(--card-media-line)',
    accent: 'var(--card-media-accent)',
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
  'shader',
  'voxel',
];

export const BLOCK_DEFAULTS: Record<
  BlockType,
  Pick<Item, 'cols' | 'rows' | 'label' | 'content'>
> = {
  h1: { cols: 12, rows: 3, label: 'headline', content: 'Geometry' },
  h2: { cols: 10, rows: 2, label: 'section', content: 'A warm grid for loose thoughts' },
  h3: { cols: 8, rows: 2, label: 'note', content: 'Small heading' },
  p: {
    cols: 10,
    rows: 4,
    label: 'paragraph',
    content:
      'Write directly into the canvas, move the block, and keep the published JSON small.',
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
    content: 'export const cell = Math.min(width / 40, height / 20);\n',
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
  shader: {
    cols: 10,
    rows: 8,
    label: 'shader',
    content: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.18;
  vec3 a = vec3(1.00, 0.44, 0.14);
  vec3 b = vec3(0.23, 0.28, 0.49);
  vec3 c = vec3(0.86, 0.73, 0.65);
  float wave = 0.5 + 0.5 * sin((uv.x + uv.y) * (1.4 + u_slider * 4.0) + t);
  vec3 col = mix(mix(a, b, uv.y), c, wave);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },
  voxel: {
    cols: 10,
    rows: 8,
    label: 'voxel',
    content: JSON.stringify(
      {
        tile: 14,
        camera: { type: 'isometric', angle: 30 },
        shapes: [
          {
            op: 'add',
            type: 'box',
            position: [0, 0, 0],
            size: [4, 1, 4],
            style: { fill: '#dbbba7', stroke: '#202124' },
          },
          {
            op: 'add',
            type: 'box',
            position: [1, 1, 1],
            size: [2, 3, 2],
            style: { fill: '#ff7124', stroke: '#202124' },
          },
        ],
      },
      null,
      2,
    ),
  },
};
