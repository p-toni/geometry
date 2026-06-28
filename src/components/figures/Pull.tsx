import { hasInlineBacklink, splitInlineBacklinks } from '../../lib/inlineBacklink';
import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import { Backlink } from './Backlink';

type PullProps = {
  x: string;
  onOpenNode?: (id: string) => void;
};

function PullBody({ x, onOpenNode }: PullProps) {
  if (!hasInlineBacklink(x)) return renderInlineMarkdown(x);
  return (
    <>
      {splitInlineBacklinks(x).map((part, i) =>
        part.kind === 'text' ? (
          <span key={i}>{renderInlineMarkdown(part.text)}</span>
        ) : (
          <Backlink
            key={i}
            title={part.title}
            rel={part.rel}
            targetId={part.targetId}
            onOpen={onOpenNode}
          />
        ),
      )}
    </>
  );
}

export function Pull({ x, onOpenNode }: PullProps) {
  const isNotation = /[→↔←]/.test(x);
  return (
    <p
      style={{
        fontFamily: isNotation ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: isNotation ? 14 : 16,
        fontStyle: isNotation ? 'normal' : 'italic',
        lineHeight: 1.55,
        color: '#3C434A',
        margin: '2px 0 14px',
        paddingLeft: 18,
      }}
    >
      <PullBody x={x} onOpenNode={onOpenNode} />
    </p>
  );
}