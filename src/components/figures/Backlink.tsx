type BacklinkProps = {
  title: string;
  rel: string;
  targetId: string;
  onOpen?: (id: string) => void;
};

export function Backlink({ title, targetId, onOpen }: BacklinkProps) {
  return (
    <button
      type="button"
      className="pressable"
      data-figure="FIG.12"
      data-testid="essay-backlink"
      onClick={() => onOpen?.(targetId)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        margin: '0 1px',
        padding: '1px 8px 1px 6px',
        background: 'var(--card)',
        border: '1px solid var(--line-soft)',
        borderRight: '3px solid var(--signal)',
        borderRadius: 3,
        cursor: onOpen ? 'pointer' : 'default',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: '0.92em',
        color: 'var(--ink)',
        verticalAlign: 'baseline',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--signal)',
          flex: 'none',
        }}
      />
      {title}
    </button>
  );
}