export function SharpDropOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none absolute inset-3 z-[80] flex items-center justify-center rounded-[8px] border border-dashed border-accent-ink/80 bg-paper/20 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] backdrop-blur-[2px]">
      drop to splat
    </div>
  );
}
