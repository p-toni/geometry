import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { spring } from '../design/motion';
import { useCanvasStore } from '../store/canvasStore';
import { hasDemoDiverged } from '../store/divergence';

export function DemoChip() {
  const diverged = useCanvasStore(hasDemoDiverged);
  const reset = useCanvasStore((state) => state.reset);

  return (
    <AnimatePresence>
      {diverged ? (
        <motion.div
          className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 shadow-lg"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={spring.chip}
        >
          <span>demo mode · changes won&apos;t save</span>
          <button
            type="button"
            title="Reset canvas (R)"
            aria-label="Reset canvas"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 transition-[border-color,transform] duration-150 ease-out hover:border-accent-ink active:scale-[0.96]"
            onClick={reset}
          >
            <RefreshCw size={12} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
