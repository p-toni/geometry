import { describe, expect, it } from 'vitest';
import {
  cellToPx,
  clamp,
  clampItemPosition,
  clampItemSize,
  deriveCanvasHeight,
  deriveCell,
  snapToCell,
} from './cellMath';

describe('cellMath', () => {
  it('clamps numbers inside bounds', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
    expect(clamp(14, 0, 10)).toBe(10);
  });

  it('snaps values to the nearest cell', () => {
    expect(snapToCell(2.49)).toBe(2);
    expect(snapToCell(2.5)).toBe(3);
  });

  it('derives canvas height after chrome', () => {
    expect(deriveCanvasHeight(800)).toBe(720);
  });

  it('derives cell from the limiting axis', () => {
    expect(deriveCell(1600, 880)).toBe(40);
    expect(deriveCell(800, 1080)).toBe(20);
  });

  it('converts cell units to pixels', () => {
    expect(cellToPx(4, 18)).toBe(72);
  });

  it('clamps item position to the 40 by 20 grid', () => {
    expect(clampItemPosition(-4, -2, 5, 5)).toEqual({ col: 0, row: 0 });
    expect(clampItemPosition(50, 50, 5, 5)).toEqual({ col: 35, row: 15 });
  });

  it('clamps item size to the remaining grid space', () => {
    expect(clampItemSize(0, 0, 10, 10)).toEqual({ cols: 1, rows: 1 });
    expect(clampItemSize(50, 50, 38, 19)).toEqual({ cols: 2, rows: 1 });
  });
});
