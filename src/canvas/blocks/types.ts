import type { Item } from '../../types';

export interface BlockRendererProps {
  item: Item;
  cell: number;
  toggled: boolean;
  sliderValue: number;
  selectorValue: string | null;
  alignValue: 'left' | 'center' | 'right';
}
