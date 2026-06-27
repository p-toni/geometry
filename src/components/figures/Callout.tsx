import { Fragment } from 'react';
import { hasInlineBacklink, splitInlineBacklinks } from '../../lib/inlineBacklink';
import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import { Backlink } from './Backlink';

type CalloutVariant = 'aside' | 'honesty' | 'update';

type CalloutProps = {
  v: CalloutVariant;
  x: string;
  label?: string;
  onOpenNode?: (id: string) => void;
};

const SKIN: Record<
  CalloutVariant,
  {
    box: {
      background: string;
      border: string;
      borderLeft: string;
    };
    label: string;
    glyph: string;
  }
> = {
  aside: {
    box: {
      background: '#F4F1EA',
      border: '1px solid #E8E2D8',
      borderLeft: '3px solid #9aa39c',
    },
    label: '#6B7280',
    glyph: '◇',
  },
  honesty: {
    box: {
      background: '#f4f6fd',
      border: '1px solid #d4dbf2',
      borderLeft: '3px solid var(--signal)',
    },
    label: 'var(--signal)',
    glyph: '⚖',
  },
  update: {
    box: {
      background: '#f1f8f4',
      border: '1px solid #c4e3d1',
      borderLeft: '3px solid #1f8a5b',
    },
    label: '#1F8A5B',
    glyph: '✚',
  },
};

function CalloutBody({ x, onOpenNode }: { x: string; onOpenNode?: (id: string) => void }) {
  if (!hasInlineBacklink(x)) return renderInlineMarkdown(x);
  return (
    <>
      {splitInlineBacklinks(x).map((part, i) =>
        part.kind === 'text' ? (
          <Fragment key={i}>{renderInlineMarkdown(part.text)}</Fragment>
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

export function Callout({ v, x, label, onOpenNode }: CalloutProps) {
  const skin = SKIN[v];
  return (
    <div
      data-figure="FIG.05"
      data-variant={v}
      style={{
        ...skin.box,
        borderRadius: 3,
        padding: '15px 17px',
        margin: '4px 0',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: skin.label,
          marginBottom: 6,
        }}
      >
        {skin.glyph} {label ?? v}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14.5,
          lineHeight: 1.55,
          color: '#2C333A',
          margin: 0,
        }}
      >
        <CalloutBody x={x} onOpenNode={onOpenNode} />
      </p>
    </div>
  );
}