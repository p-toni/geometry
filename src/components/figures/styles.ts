import type { CSSProperties } from 'react';

/** Registry SoT: Figures - Essay Widget Registry.dc.html */
export const registry = {
  paper: '#FAF8F4',
  paper2: '#F4F1EA',
  ink: '#1C1F24',
  body: '#2C333A',
  muted: '#3C434A',
  kicker: '#9aa39c',
  line: '#D5CEC3',
  lineSoft: '#E8E2D8',
  lineHair: '#F2EDE6',
  signal: '#1F4DB8',
  signalTint: '#eef2fd',
  signalBorder: '#d4dbf2',
  readAccent: 'var(--read-accent)',
  readAccentDeep: 'var(--read-accent-deep)',
  readAccentTint: 'var(--read-accent-tint)',
  readAccentBorder: 'var(--read-accent-border)',
  readOwned: 'var(--read-owned)',
  readOwnedTint: 'var(--read-owned-tint)',
  readOwnedBorder: 'var(--read-owned-border)',
  semanticGreen: '#1F8A5B',
  semanticOrange: '#C2410C',
} as const;

export const mono = {
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

export const body = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--prose-size)',
  lineHeight: 'var(--prose-leading)',
  color: 'var(--prose-color)',
};

export const proseLead = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--prose-lead-size)',
  lineHeight: 'var(--prose-lead-leading)',
  color: 'var(--prose-lead-color)',
};

export const proseInset = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--prose-inset-size)',
  lineHeight: 'var(--prose-inset-leading)',
  color: 'var(--prose-inset-color)',
};

export const figureShell: CSSProperties = {
  margin: '18px 0 22px',
  background: registry.paper,
  border: `1px solid ${registry.lineSoft}`,
  borderRadius: 5,
  overflow: 'hidden',
};

export const figureKicker: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: registry.kicker,
  padding: '14px 20px',
  borderBottom: `1px solid ${registry.lineHair}`,
};