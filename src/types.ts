export type BlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'p'
  | 'quote'
  | 'markdown'
  | 'code'
  | 'embed'
  | 'image'
  | 'link';

export type ColorToken = 0 | 1 | 2 | 3 | 4 | 5;

export type ToggleControl = { id: string; kind: 'toggle'; value: boolean };
export type SliderControl = {
  id: string;
  kind: 'slider';
  value: number;
  min: number;
  max: number;
};
export type SelectorControl = {
  id: string;
  kind: 'selector';
  value: string;
  options: { label: string; value: string }[];
};
export type ActionControl = { id: string; kind: 'action' };
export type AlignControl = { id: string; kind: 'align'; value: 'left' | 'center' | 'right' };
export type Control =
  | ToggleControl
  | SliderControl
  | SelectorControl
  | ActionControl
  | AlignControl;

export interface Item {
  id: string;
  type: BlockType;
  col: number;
  row: number;
  cols: number;
  rows: number;
  color: ColorToken;
  label: string;
  content: string;
  linkIcon?: string;
  controls?: Control[];
  refreshKey?: number;
}

export interface Canvas {
  version: 1;
  slug: string;
  title: string;
  background?: 'paper' | 'ink';
  items: Item[];
}
