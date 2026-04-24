import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { tween } from '../../design/motion';
import { slugToPath } from '../../lib/paths';
import type { BlockRendererProps } from './types';

export function Link({ item }: BlockRendererProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      data-no-drag="true"
      className="group flex h-full w-full flex-col justify-end rounded-[6px] border border-ink/10 bg-paper/50 p-3 text-left transition hover:border-accent-ink"
      whileHover={{ y: -2 }}
      transition={tween.hover}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        navigate(slugToPath(item.content));
      }}
    >
      <span
        className="font-display text-[24px] leading-none"
        style={{ fontVariationSettings: `'opsz' 72, 'SOFT' 30, 'WONK' 1` }}
      >
        {item.label}
      </span>
      <span className="mt-2 h-px w-full origin-left scale-x-0 bg-accent-ink transition-transform duration-150 group-hover:scale-x-100" />
      <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
        {item.content === 'home' ? '/' : item.content}
      </span>
    </motion.button>
  );
}
