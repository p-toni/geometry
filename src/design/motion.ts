export const spring = {
  drag: { type: 'spring', stiffness: 400, damping: 30 },
  pop: { type: 'spring', stiffness: 500, damping: 25 },
  chip: { type: 'spring', stiffness: 450, damping: 28 },
} as const;

export const tween = {
  hover: { duration: 0.15, ease: [0.23, 1, 0.32, 1] as const },
  panel: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const },
  route: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const },
} as const;
