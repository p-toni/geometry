import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tween } from '../../design/motion';
import { cn } from '../../lib/cn';
import { LinkIcon } from '../../lib/linkIcons';
import { slugToPath } from '../../lib/paths';
import type { BlockRendererProps } from './types';

function isExternalHref(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith('mailto:');
}

function displayTarget(value: string) {
  if (value === 'home') return '/';
  if (value.startsWith('https://')) return value.replace(/^https:\/\//i, '');
  if (value.startsWith('http://')) return value.replace(/^http:\/\//i, '');
  return value;
}

export function Link({ item }: BlockRendererProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isCompact = item.rows <= 3 || item.cols <= 8;
  const external = isExternalHref(item.content);

  const body = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[6px] border border-accent/45 bg-paper text-accent-ink shadow-sm transition-[border-color] duration-150 ease-out group-hover:border-accent',
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
              'min-w-0 truncate font-display leading-none tracking-normal',
              isCompact ? 'text-[18px]' : 'text-[28px]',
            )}
            style={{ fontWeight: 650 }}
          >
            {item.label}
          </span>
          {!isCompact ? (
            <ArrowRight
              size={16}
              className="mt-1 shrink-0 text-ink-2 transition-[color,transform] duration-150 ease-out group-hover:translate-x-1 group-hover:text-accent-ink"
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
          {displayTarget(item.content)}
        </span>
      </span>
    </>
  );

  const className = cn(
    'group flex h-full w-full text-left transition-transform duration-150 ease-out active:scale-[0.985]',
    isCompact ? 'items-end gap-2' : 'items-stretch gap-3',
  );

  if (external) {
    return (
      <motion.a
        href={item.content}
        target="_blank"
        rel="noreferrer"
        data-no-drag="true"
        className={className}
        whileHover={reduceMotion ? undefined : { transform: 'translateY(-2px)' }}
        transition={tween.hover}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {body}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      data-no-drag="true"
      className={className}
      whileHover={reduceMotion ? undefined : { transform: 'translateY(-2px)' }}
      transition={tween.hover}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        navigate(slugToPath(item.content));
      }}
    >
      {body}
    </motion.button>
  );
}
