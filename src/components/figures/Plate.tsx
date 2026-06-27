import { registry } from './styles';

type PlateProps = {
  cap: string;
  src?: string;
  inline?: boolean;
};

export function Plate({ cap, src, inline = true }: PlateProps) {
  const [label, ...rest] = cap.split(' — ');
  const caption = rest.length ? rest.join(' — ') : cap;

  const image = (
    <div
      style={{
        position: 'relative',
        height: 200,
        border: `1px solid ${registry.line}`,
        borderRadius: 3,
        background: src
          ? `url(${src}) center/cover no-repeat, ${registry.paper2}`
          : registry.paper2,
        backgroundImage: src
          ? `url(${src}) center/cover no-repeat`
          : `repeating-linear-gradient(135deg,transparent,transparent 9px,rgba(31,77,184,.06) 9px,rgba(31,77,184,.06) 10px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 2px 7px rgba(28,31,36,.05)',
      }}
    >
      {!src ? (
        <>
          <div
            style={{
              width: 96,
              height: 108,
              background: registry.paper,
              border: '1px solid #b9c0c6',
              boxShadow: '0 8px 22px rgba(28,31,36,.16)',
              transform: 'rotate(-4deg)',
              clipPath: 'polygon(18% 0,100% 8%,86% 100%,0 86%)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: 13,
              top: 11,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#7d867f',
            }}
          >
            plate · drop svg here
          </span>
        </>
      ) : null}
    </div>
  );

  const captionEl = (
    <figcaption
      style={{
        display: 'flex',
        gap: 11,
        marginTop: 12,
        alignItems: 'baseline',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: 'var(--signal)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.5,
          color: registry.muted,
        }}
      >
        {caption}
        {src ? (
          <span style={{ color: registry.kicker }}> {src}</span>
        ) : null}
      </span>
    </figcaption>
  );

  return (
    <figure data-figure="FIG.02" data-testid="cut-plate" style={{ margin: inline ? '8px 0 20px' : '18px 0 22px' }}>
      {image}
      {captionEl}
    </figure>
  );
}