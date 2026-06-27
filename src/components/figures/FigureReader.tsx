import type { Block } from '../../pool/types';
import { renderBlock } from './renderBlock';

type FigureReaderProps = {
  blocks: Block[];
  onOpenNode?: (id: string) => void;
};

/** Renders essay blocks only — chrome lives in ReadPanel (prototype). */
export function FigureReader({ blocks, onOpenNode }: FigureReaderProps) {
  let seenSection = false;

  return (
    <article className="field-prose" data-testid="figure-reader">
      {blocks.map((block, i) => {
        const isFirstSection = block.t === 'h' && block.level === 2 && !seenSection;
        if (isFirstSection) seenSection = true;
        return renderBlock(block, i, { onOpenNode, isFirstSection });
      })}
    </article>
  );
}