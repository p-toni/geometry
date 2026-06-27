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
      data-figure="FIG.12"
      onClick={() => onOpen?.(targetId)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        margin: '0 2px',
        padding: '3px 10px 3px 8px',
        background: 'var(--card)',
        border: '1px solid var(--line-soft)',
        borderRight: '3px solid var(--signal)',
        borderRadius: 3,
        cursor: onOpen ? 'pointer' : 'default',
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: 14,
        color: 'var(--ink)',
        verticalAlign: 'baseline',
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