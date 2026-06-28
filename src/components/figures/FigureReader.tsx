import type { Block } from '../../pool/types';
import { createFootnoteRegistry } from '../../lib/footnotes';
import { SectionFootnotes } from './Citation';
import { renderBlock } from './renderBlock';

type FigureReaderProps = {
  blocks: Block[];
  onOpenNode?: (id: string) => void;
};

function splitSections(blocks: Block[]): Block[][] {
  const sections: Block[][] = [];
  let current: Block[] = [];

  for (const block of blocks) {
    const isSectionStart = block.t === 'h' && (block.level ?? 2) === 2;
    if (isSectionStart && current.length) {
      sections.push(current);
      current = [];
    }
    current.push(block);
  }
  if (current.length) sections.push(current);
  return sections.length ? sections : [blocks];
}

/** Renders essay blocks only — chrome lives in ReadPanel (prototype). */
export function FigureReader({ blocks, onOpenNode }: FigureReaderProps) {
  const sections = splitSections(blocks);
  let seenSection = false;

  return (
    <article className="field-prose" data-testid="figure-reader">
      {sections.map((sectionBlocks, si) => {
        const footnotes = createFootnoteRegistry();
        return (
          <section key={si} data-essay-section={si}>
            {sectionBlocks.map((block, i) => {
              const isFirstSection =
                block.t === 'h' && block.level === 2 && !seenSection;
              if (isFirstSection) seenSection = true;
              return renderBlock(block, i, { onOpenNode, isFirstSection, footnotes });
            })}
            <SectionFootnotes entries={footnotes.entries()} />
          </section>
        );
      })}
    </article>
  );
}