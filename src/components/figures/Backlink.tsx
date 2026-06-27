type BacklinkProps = {
  title: string;
  rel: string;
  targetId: string;
  onOpen?: (id: string) => void;
};

export function Backlink({ title, targetId, onOpen }: BacklinkProps) {
  const interactive = Boolean(onOpen);

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className="essay-backlink pressable"
      data-figure="FIG.12"
      data-testid="essay-backlink"
      onClick={() => onOpen?.(targetId)}
      onKeyDown={(e) => {
        if (!onOpen) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(targetId);
        }
      }}
    >
      <span className="essay-backlink__dot" aria-hidden />
      {title}
    </span>
  );
}