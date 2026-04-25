import { FOOTER_HEIGHT, GRID_COLS, GRID_ROWS, HEADER_HEIGHT } from '../../constants';

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function snapToCell(value: number) {
  return Math.round(value);
}

export function deriveCanvasHeight(viewportHeight: number) {
  return Math.max(0, viewportHeight - HEADER_HEIGHT - FOOTER_HEIGHT);
}

export function deriveCell(viewportWidth: number, viewportHeight: number) {
  const canvasHeight = deriveCanvasHeight(viewportHeight);
  return Math.max(1, Math.min(viewportWidth / GRID_COLS, canvasHeight / GRID_ROWS));
}

export function cellToPx(cellValue: number, cell: number) {
  return cellValue * cell;
}

export function clampItemSize(cols: number, rows: number) {
  return {
    cols: clamp(snapToCell(cols), 1, GRID_COLS),
    rows: clamp(snapToCell(rows), 1, GRID_ROWS),
  };
}

export function clampItemPosition(col: number, row: number) {
  return {
    col: clamp(snapToCell(col), 0, GRID_COLS - 1),
    row: clamp(snapToCell(row), 0, GRID_ROWS - 1),
  };
}
