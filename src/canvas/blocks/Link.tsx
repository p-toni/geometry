import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tween } from '../../design/motion';
import { cn } from '../../lib/cn';
import { LinkIcon } from '../../lib/linkIcons';
import { slugToPath } from '../../lib/paths';
import type { BlockRendererProps } from './types';

export function Link({ item }: BlockRendererProps) {
  const navigate = useNavigate();
  const isCompact = item.rows <= 3 || item.cols <= 8;

  return (
    <motion.button
      type="button"
      data-no-drag="true"
      className={cn(
        'group flex h-full w-full text-left transition',
        isCompact ? 'items-end gap-2' : 'items-stretch gap-3',
      )}
      whileHover={{ y: -2 }}
      transition={tween.hover}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        navigate(slugToPath(item.content));
      }}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[10px] border border-line/80 bg-white text-accent-ink shadow-sm transition group-hover:border-accent',
          isCompact ? 'h-9 w-9' : 'h-full min-h-16 w-16',
        )}
        aria-hidden="true"
      >
        <LinkIcon name={item.linkIcon} size={isCompact ? 18 : 25} strokeWidth={1.8} />
      </span>
      <span className={cn('flex min-w-0 flex-1 flex-col', isCompact ? 'justify-end' : 'justify-between')}>
        <span className="flex min-w-0 items-start justify-between gap-2">
          <span
            className={cn(
              'min-w-0 truncate font-display font-bold leading-none tracking-normal',
              isCompact ? 'text-[18px]' : 'text-[28px]',
            )}
          >
            {item.label}
          </span>
          {!isCompact ? (
            <ArrowRight
              size={16}
              className="mt-1 shrink-0 text-ink-2 transition group-hover:translate-x-1 group-hover:text-accent-ink"
            />
          ) : null}
        </span>
        <span
          className={cn(
            'h-px w-full origin-left scale-x-0 bg-accent-ink transition-transform duration-150 group-hover:scale-x-100',
            isCompact ? 'mt-1' : 'my-2',
          )}
        />
        <span
          className={cn(
            'max-w-full truncate font-mono uppercase tracking-[0.12em] text-ink-2',
            isCompact ? 'text-[8px]' : 'text-[10px]',
          )}
        >
          {item.content === 'home' ? '/' : item.content}
        </span>
      </span>
    </motion.button>
  );
}
