import type { ReactNode } from 'react';
import { splitInlineBacklinks } from '../../lib/inlineBacklink';
import type { Block } from '../../pool/types';
import { Backlink } from './Backlink';
import { Callout } from './Callout';
import { Curvature } from './Curvature';
import { DiagnosticTable } from './DiagnosticTable';
import { EdgeTaxonomy } from './EdgeTaxonomy';
import { LateFailure } from './LateFailure';
import { Plate } from './Plate';
import { PointEdge } from './PointEdge';
import { ProtocolStepper } from './ProtocolStepper';
import { Sidenote } from './Sidenote';
import { Thesis } from './Thesis';

type RenderOpts = {
  onOpenNode?: (id: string) => void;
};

export function renderBlock(block: Block, key: number, opts: RenderOpts = {}): ReactNode {
  const { onOpenNode } = opts;

  switch (block.t) {
    case 'p': {
      const parts = splitInlineBacklinks(block.x);
      const pStyle = {
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        lineHeight: 1.66,
        color: '#2c333a',
        margin: '0 0 17px',
      } as const;
      if (parts.length === 1 && parts[0]!.kind === 'text') {
        return (
          <p key={key} style={pStyle}>
            {parts[0]!.text}
          </p>
        );
      }
      return (
        <p key={key} style={pStyle}>
          {parts.map((part, i) =>
            part.kind === 'text' ? (
              <span key={i}>{part.text}</span>
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
        </p>
      );
    }
    case 'h':
      return (
        <h2
          key={key}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            margin: '26px 0 12px',
          }}
        >
          {block.x}
        </h2>
      );
    case 'thesis':
      return <Thesis key={key} x={block.x} k={block.k} />;
    case 'callout':
      return <Callout key={key} v={block.v} x={block.x} label={block.label} />;
    case 'sidenote':
      return <Sidenote key={key} anchor={block.anchor} x={block.x} />;
    case 'plate':
      return <Plate key={key} cap={block.cap} src={block.src} />;
    case 'table':
      return <DiagnosticTable key={key} />;
    case 'edge-taxonomy':
      return <EdgeTaxonomy key={key} rows={block.rows} />;
    case 'steps':
      return <ProtocolStepper key={key} />;
    case 'motif':
      return <LateFailure key={key} />;
    case 'point-edge':
      return <PointEdge key={key} />;
    case 'curvature':
      return <Curvature key={key} />;
    case 'backlink':
      return (
        <Backlink
          key={key}
          title={block.title}
          rel={block.rel}
          targetId={block.targetId}
          onOpen={onOpenNode}
        />
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

