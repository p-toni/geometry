import { body, figureKicker, figureShell, mono } from './styles';

type PlateProps = {
  cap: string;
  src?: string;
  inline?: boolean;
};

export function Plate({ cap, src, inline = true }: PlateProps) {
  const image = (
    <div
      style={{
        minHeight: inline ? 160 : 180,
        border: '1px solid #cfd4cf',
        borderRadius: 3,
        background: src
          ? `url(${src}) center/cover no-repeat`
          : 'repeating-linear-gradient(135deg,#dfe3df,#dfe3df 8px,#e9ece8 8px,#e9ece8 16px)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 13,
      }}
    >
      {!src ? (
        <span style={{ ...mono, fontSize: 10, color: '#7d867f' }}>draft plate · no render</span>
      ) : null}
    </div>
  );

  const caption = (
    <figcaption
      style={{
        ...body,
        fontSize: 13,
        marginTop: 10,
        color: 'var(--muted)',
      }}
    >
      {cap}
    </figcaption>
  );

  if (inline) {
    return (
      <figure data-figure="FIG.02" data-testid="cut-plate" style={{ margin: '8px 0 20px' }}>
        {image}
        {caption}
      </figure>
    );
  }

  return (
    <figure data-figure="FIG.02" data-testid="cut-plate" style={figureShell} className="depth-raised">
      <div style={{ ...figureKicker, color: 'var(--signal)' }}>FIG.02 · plate</div>
      <div style={{ padding: 14 }}>
        {image}
        {caption}
      </div>
    </figure>
  );
}