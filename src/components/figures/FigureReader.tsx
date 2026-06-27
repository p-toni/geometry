import type { Block } from '../../pool/types';
import { renderBlock } from './renderBlock';

type FigureReaderProps = {
  blocks: Block[];
  onOpenNode?: (id: string) => void;
};

/** Renders essay blocks only — chrome lives in ReadPanel (prototype). */
export function FigureReader({ blocks, onOpenNode }: FigureReaderProps) {
  return (
    <article className="field-prose" data-testid="figure-reader">
      {blocks.map((block, i) => renderBlock(block, i, { onOpenNode }))}
    </article>
  );
}