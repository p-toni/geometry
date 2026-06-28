import { Fragment, type ReactNode } from 'react';
import { splitCitationTokens } from '../../lib/citation';
import type { FootnoteRegistry } from '../../lib/footnotes';
import { splitInlineBacklinks } from '../../lib/inlineBacklink';
import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import type { Block } from '../../pool/types';
import { Citation, FootnoteMarker, SourcesLedger } from './Citation';
import { Diagram } from './Diagram';
import { Backlink } from './Backlink';
import { Callout } from './Callout';
import { Curvature } from './Curvature';
import { Contrast } from './Contrast';
import { MarkdownTable } from './MarkdownTable';
import { EdgeTaxonomy } from './EdgeTaxonomy';
import { LateFailure } from './LateFailure';
import { Plate } from './Plate';
import { PointEdge } from './PointEdge';
import { Ladder } from './Ladder';
import { ProtocolStepper } from './ProtocolStepper';
import { Sidenote } from './Sidenote';
import { SectionRail } from './SectionRail';
import { Pull } from './Pull';
import { Thesis } from './Thesis';
import { sectionRailMeta } from '../../lib/argumentGrammar';
import { sectionSlug } from '../../lib/sectionSlug';

type RenderOpts = {
  onOpenNode?: (id: string) => void;
  isFirstSection?: boolean;
  footnotes: FootnoteRegistry;
};

const proseParagraphStyle = { margin: '0 0 var(--prose-paragraph-gap)' } as const;

function renderProseWithFootnotes(
  text: string,
  footnotes: FootnoteRegistry,
  onOpenNode?: (id: string) => void,
): ReactNode[] {
  const parts = splitInlineBacklinks(text);
  const out: ReactNode[] = [];
  let key = 0;

  for (const part of parts) {
    if (part.kind === 'backlink') {
      out.push(
        <Backlink
          key={key++}
          title={part.title}
          rel={part.rel}
          targetId={part.targetId}
          onOpen={onOpenNode}
        />,
      );
      continue;
    }
    for (const seg of splitCitationTokens(part.text, footnotes)) {
      if (seg.kind === 'text') {
        out.push(<Fragment key={key++}>{renderInlineMarkdown(seg.text)}</Fragment>);
      } else {
        out.push(<FootnoteMarker key={key++} n={seg.n} />);
      }
    }
  }
  return out;
}

export function renderBlock(block: Block, key: number, opts: RenderOpts): ReactNode {
  const { onOpenNode, isFirstSection, footnotes } = opts;

  switch (block.t) {
    case 'p': {
      const parts = splitInlineBacklinks(block.x);
      const hasFootnotes =
        parts.some((p) => p.kind === 'text' && splitCitationTokens(p.text, footnotes).some((s) => s.kind === 'footnote')) ||
        (parts.length === 1 &&
          parts[0]!.kind === 'text' &&
          splitCitationTokens(parts[0]!.text, footnotes).some((s) => s.kind === 'footnote'));

      if (parts.length === 1 && parts[0]!.kind === 'text') {
        const text = parts[0]!.text;
        if (text.startsWith('• ') && !hasFootnotes) {
          return (
            <p key={key} style={{ ...proseParagraphStyle, paddingLeft: 18, textIndent: -14 }}>
              {renderInlineMarkdown(text)}
            </p>
          );
        }
      }

      return (
        <p key={key} style={proseParagraphStyle}>
          {renderProseWithFootnotes(block.x, footnotes, onOpenNode)}
        </p>
      );
    }
    case 'h': {
      const isSub = block.level === 3;
      if (isSub) {
        return (
          <h3 key={key} className="type-display">
            {block.x}
          </h3>
        );
      }
      const slug = sectionSlug(block.x);
      const rail = sectionRailMeta(block.x, 2);
      if (rail) {
        return <SectionRail key={key} {...rail} isFirst={isFirstSection} sectionSlug={slug} />;
      }
      return (
        <h2 key={key} data-section={slug} className="type-display">
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
    case 'pull':
      return <Pull key={key} x={block.x} onOpenNode={onOpenNode} />;
    case 'sidenote':
      return <Sidenote key={key} anchor={block.anchor} x={block.x} body={block.body} />;
    case 'plate':
      return <Plate key={key} cap={block.cap} src={block.src} />;
    case 'table':
      return <MarkdownTable key={key} headers={block.headers} rows={block.rows} />;
    case 'contrast':
      return (
        <Contrast
          key={key}
          mode={block.mode}
          poles={block.poles}
          ownedPole={block.ownedPole}
          axisLabel={block.axisLabel}
          rows={block.rows}
        />
      );
    case 'edge-taxonomy':
      return <EdgeTaxonomy key={key} rows={block.rows} />;
    case 'ladder':
      return <Ladder key={key} mode={block.mode} rungs={block.rungs} />;
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
        <p key={key} style={proseParagraphStyle}>
          <Backlink
            title={block.title}
            rel={block.rel}
            targetId={block.targetId}
            onOpen={onOpenNode}
          />
        </p>
      );
    case 'diagram':
      return (
        <Fragment key={key}>
          {block.lead ? (
            <p key={`${key}-lead`} style={proseParagraphStyle}>
              {renderInlineMarkdown(block.lead)}
            </p>
          ) : null}
          <Diagram {...block} />
          {block.follow ? (
            <p key={`${key}-follow`} style={proseParagraphStyle}>
              {renderInlineMarkdown(block.follow)}
            </p>
          ) : null}
        </Fragment>
      );
    case 'citation':
      return <Citation key={key} {...block} />;
    case 'sources-ledger':
      return <SourcesLedger key={key} items={block.items} />;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}