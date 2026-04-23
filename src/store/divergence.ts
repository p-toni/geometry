import type { CanvasState } from './canvasStore';

export function hasDemoDiverged(state: CanvasState) {
  return state.hasDiverged;
}
