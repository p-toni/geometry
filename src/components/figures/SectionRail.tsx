import type { SectionRailMeta } from '../../lib/argumentGrammar';
import { registry } from './styles';

type SectionRailProps = SectionRailMeta & {
  isFirst?: boolean;
  sectionSlug?: string;
};

function operatorDetail(display: string): string | null {
  const m = display.match(/^operator\s*\d*\s*:?\s*(.+)$/i);
  return m?.[1]?.trim() || null;
}

/** Registry category header — A·frame / hairline / tagline. */
export function SectionRail({ display, letter, role, tagline, tier, isFirst, sectionSlug }: SectionRailProps) {
  const kicker =
    tier === 'grammar' ? `${letter} · ${role}` : letter === '·' ? role : `${letter} · ${role}`;
  const detail = tier === 'grammar' && role === 'operator' ? operatorDetail(display) : null;

  return (
    <header
      data-figure="section-rail"
      data-tier={tier}
      data-testid="section-rail"
      data-section={sectionSlug}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        margin: isFirst ? '8px 0 20px' : tier === 'grammar' ? '44px 0 18px' : '32px 0 16px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: tier === 'grammar' ? 11 : 10,
          letterSpacing: tier === 'grammar' ? '0.2em' : '0.14em',
          textTransform: 'uppercase',
          color: tier === 'grammar' ? registry.readAccent : registry.kicker,
          whiteSpace: 'nowrap',
        }}
      >
        {kicker}
      </span>
      <span
        aria-hidden
        style={{
          flex: 1,
          height: 1,
          background: tier === 'grammar' ? registry.line : registry.lineSoft,
        }}
      />
      {tagline || detail ? (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            lineHeight: 1.4,
            color: registry.kicker,
            maxWidth: '46%',
            textAlign: 'right',
          }}
        >
          {detail ? (
            <span style={{ display: 'block', fontWeight: 600, color: registry.muted, marginBottom: 2 }}>
              {detail}
            </span>
          ) : null}
          {display !== role && tier === 'beat' && !detail ? (
            <>
              <span style={{ fontWeight: 600, color: registry.muted }}>{display}</span>
              <span style={{ color: registry.line }}> · </span>
            </>
          ) : null}
          {tagline}
        </span>
      ) : (
        <span
          className="type-display"
          style={{
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '-0.015em',
            color: registry.ink,
          }}
        >
          {display}
        </span>
      )}
    </header>
  );
}