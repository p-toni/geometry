type CalloutVariant = 'aside' | 'honesty' | 'update';

type CalloutProps = {
  v: CalloutVariant;
  x: string;
  label?: string;
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
      background: '#f6f7f4',
      border: '1px solid #e4e7e3',
      borderLeft: '3px solid #9aa39c',
    },
    label: 'var(--muted)',
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
    label: '#1f8a5b',
    glyph: '✚',
  },
};

export function Callout({ v, x, label }: CalloutProps) {
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
          color: '#2c333a',
          margin: 0,
        }}
      >
        {x}
      </p>
    </div>
  );
}