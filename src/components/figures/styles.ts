import type { CSSProperties } from 'react';

/** Shared inline tokens for Figures — drafting-paper aesthetic. */
export const mono = {
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

export const body = {
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  lineHeight: 1.62,
  color: '#2c333a',
};

export const figureShell: CSSProperties = {
  margin: '22px 0',
  background: 'var(--card)',
  border: '1px solid var(--line-soft)',
  borderRadius: 3,
  overflow: 'hidden',
};

export const figureKicker: CSSProperties = {
  ...mono,
  fontSize: 10,
  letterSpacing: '0.12em',
  color: 'var(--kicker)',
  padding: '10px 14px',
  borderBottom: '1px solid var(--line-soft)',
};