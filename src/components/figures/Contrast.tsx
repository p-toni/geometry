import type { CSSProperties } from 'react';
import type { ContrastData, ContrastMode, ContrastRow } from '../../lib/contrast';

type Props = ContrastData;

function pairHead(owned: boolean): CSSProperties {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: owned ? 'var(--read-owned)' : '#A39B8C',
    padding: '0 0 12px',
    borderBottom: `2px solid ${owned ? 'var(--read-owned)' : '#E7E2D8'}`,
  };
}

function pairCell(owned: boolean): CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    lineHeight: 1.45,
    color: owned ? 'var(--ink)' : 'var(--muted)',
    fontWeight: owned ? 500 : 400,
    padding: '15px 18px 15px 0',
    borderTop: '1px solid #EFEBE2',
    background: owned ? 'linear-gradient(90deg, rgba(194,65,12,.06), transparent)' : 'transparent',
  };
}

function tableHead(kind: 'axis' | 'a' | 'b', aOwned: boolean, bOwned: boolean): CSSProperties {
  const owned = kind === 'a' ? aOwned : kind === 'b' ? bOwned : false;
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '11px 14px',
    color:
      kind === 'axis' ? 'var(--muted)' : owned ? 'var(--read-owned)' : '#A39B8C',
    background:
      kind === 'axis' ? '#F1EEE7' : owned ? 'var(--read-owned-tint)' : '#F1EEE7',
    borderLeft: kind === 'axis' ? undefined : '1px solid #E7E2D8',
  };
}

function tableCell(owned: boolean): CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    lineHeight: 1.4,
    color: owned ? 'var(--ink)' : '#A39B8C',
    padding: '12px 14px',
    borderTop: '1px solid #EFEBE2',
    borderLeft: '1px solid #E7E2D8',
    background: owned ? 'var(--read-owned-tint)' : 'transparent',
  };
}

function LineSkin({
  poles,
  ownedPole,
  rows,
}: {
  poles: [string, string];
  ownedPole: 0 | 1;
  rows: ContrastRow[];
}) {
  const row = rows[0]!;
  const aOwned = ownedPole === 0;
  const bOwned = ownedPole === 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '14px 0',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#A39B8C',
            marginBottom: 7,
          }}
        >
          {poles[0]} feels like
        </div>
        <div
          className="type-display"
          style={{
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '-0.02em',
            color: aOwned ? 'var(--ink)' : '#A39B8C',
          }}
        >
          {row.a}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 320,
        }}
      >
        <span style={{ flex: 1, height: 1, background: '#E7E2D8' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--read-owned)',
          }}
        >
          vs
        </span>
        <span style={{ flex: 1, height: 1, background: '#E7E2D8' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--read-owned)',
            marginBottom: 7,
          }}
        >
          {poles[1]} feels like
        </div>
        <div
          className="type-display"
          style={{
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: '-0.025em',
            color: bOwned ? 'var(--ink)' : '#A39B8C',
          }}
        >
          {row.b}
        </div>
      </div>
    </div>
  );
}

function PairSkin({
  poles,
  ownedPole,
  rows,
}: {
  poles: [string, string];
  ownedPole: 0 | 1;
  rows: ContrastRow[];
}) {
  const aOwned = ownedPole === 0;
  const bOwned = ownedPole === 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={pairHead(aOwned)}>{poles[0]}</div>
      <div style={pairHead(bOwned)}>{poles[1]}</div>
      {rows.map((row) => (
        <div key={`${row.a}-${row.b}`} style={{ display: 'contents' }}>
          <div style={pairCell(aOwned)}>{row.a}</div>
          <div style={pairCell(bOwned)}>{row.b}</div>
        </div>
      ))}
    </div>
  );
}

function TableSkin({
  poles,
  ownedPole,
  axisLabel,
  rows,
}: {
  poles: [string, string];
  ownedPole: 0 | 1;
  axisLabel?: string;
  rows: ContrastRow[];
}) {
  const aOwned = ownedPole === 0;
  const bOwned = ownedPole === 1;

  return (
    <div
      className="contrast-table"
    >
      <div style={tableHead('axis', aOwned, bOwned)}>{axisLabel ?? 'axis'}</div>
      <div style={tableHead('a', aOwned, bOwned)}>{poles[0]}</div>
      <div style={tableHead('b', aOwned, bOwned)}>{poles[1]}</div>
      {rows.map((row) => (
        <div key={row.label ?? `${row.a}-${row.b}`} style={{ display: 'contents' }}>
          <div
            className="type-display"
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: 'var(--ink)',
              padding: '12px 14px',
              borderTop: '1px solid #EFEBE2',
            }}
          >
            {row.label}
          </div>
          <div style={tableCell(aOwned)}>{row.a}</div>
          <div style={tableCell(bOwned)}>{row.b}</div>
        </div>
      ))}
    </div>
  );
}

/** Node spec 02 — contrast read skin (line / pair / table). */
export function Contrast({ mode, poles, ownedPole, axisLabel, rows }: Props) {
  return (
    <div
      data-node="contrast"
      data-contrast-mode={mode}
      data-testid={mode === 'table' ? 'diagnostic-table' : undefined}
      className={mode === 'table' ? 'figure-registry markdown-table-wrap' : undefined}
      style={mode === 'table' ? undefined : { margin: '8px 0 20px' }}
    >
      {mode === 'line' ? (
        <LineSkin poles={poles} ownedPole={ownedPole} rows={rows} />
      ) : mode === 'pair' ? (
        <PairSkin poles={poles} ownedPole={ownedPole} rows={rows} />
      ) : (
        <>
          <div className="figure-registry__kicker">Contrast · {axisLabel ?? 'axis'}</div>
          <div className="figure-registry__body" style={{ padding: 0 }}>
            <TableSkin poles={poles} ownedPole={ownedPole} axisLabel={axisLabel} rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}

export type { ContrastMode, ContrastRow };
