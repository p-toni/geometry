import { Fragment, type ReactNode } from 'react';
import { splitInlineBacklinks } from '../../lib/inlineBacklink';
import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import type { Block } from '../../pool/types';
import { Backlink } from './Backlink';
import { Callout } from './Callout';
import { Curvature } from './Curvature';
import { DiagnosticTable } from './DiagnosticTable';
import { MarkdownTable } from './MarkdownTable';
import { EdgeTaxonomy } from './EdgeTaxonomy';
import { LateFailure } from './LateFailure';
import { Plate } from './Plate';
import { PointEdge } from './PointEdge';
import { ProtocolStepper } from './ProtocolStepper';
import { Sidenote } from './Sidenote';
import { SectionRail } from './SectionRail';
import { Thesis } from './Thesis';
import { sectionRailMeta } from '../../lib/argumentGrammar';

type RenderOpts = {
  onOpenNode?: (id: string) => void;
  isFirstSection?: boolean;
};

export function renderBlock(block: Block, key: number, opts: RenderOpts = {}): ReactNode {
  const { onOpenNode, isFirstSection } = opts;

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
      const renderPart = (part: (typeof parts)[number], i: number) =>
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
        );

      if (parts.length === 1 && parts[0]!.kind === 'text') {
        const text = parts[0]!.text;
        if (text.startsWith('• ')) {
          return (
            <p key={key} style={{ ...pStyle, paddingLeft: 18, textIndent: -14 }}>
              {renderInlineMarkdown(text)}
            </p>
          );
        }
        return (
          <p key={key} style={pStyle}>
            {renderInlineMarkdown(text)}
          </p>
        );
      }
      return (
        <p key={key} style={pStyle}>
          {parts.map(renderPart)}
        </p>
      );
    }
    case 'h': {
      const isSub = block.level === 3;
      if (isSub) {
        return (
          <h3
            key={key}
            className="type-display"
            style={{
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '-0.01em',
              color: '#3C434A',
              margin: '20px 0 10px',
            }}
          >
            {block.x}
          </h3>
        );
      }
      const rail = sectionRailMeta(block.x, 2);
      if (rail) {
        return <SectionRail key={key} {...rail} isFirst={isFirstSection} />;
      }
      return (
        <h2
          key={key}
          className="type-display"
          style={{
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
    }
    case 'thesis':
      return <Thesis key={key} x={block.x} k={block.k} />;
    case 'callout':
      return (
        <Callout
          key={key}
          v={block.v}
          x={block.x}
          label={block.label}
          onOpenNode={onOpenNode}
        />
      );
    case 'sidenote':
      return <Sidenote key={key} anchor={block.anchor} x={block.x} body={block.body} />;
    case 'plate':
      return <Plate key={key} cap={block.cap} src={block.src} />;
    case 'table': {
      const isDiagnostic =
        block.headers.length === 3 &&
        block.headers[0]?.toLowerCase() === 'test' &&
        block.headers[1]?.toLowerCase() === 'geometry' &&
        block.headers[2]?.toLowerCase() === 'retrieval';
      return isDiagnostic ? (
        <DiagnosticTable key={key} />
      ) : (
        <MarkdownTable key={key} headers={block.headers} rows={block.rows} />
      );
    }
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
        <p key={key} style={{ margin: '0 0 17px' }}>
          <Backlink
            title={block.title}
            rel={block.rel}
            targetId={block.targetId}
            onOpen={onOpenNode}
          />
        </p>
      );
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

