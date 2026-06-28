import type { FieldEdge } from './fieldSchema';
import { edgeStroke } from './fieldSchema';

export type Point = { x: number; y: number };

/** Head-dot at ~78% along segment (spec 04 · direction → head-dot). */
export function headDotPosition(from: Point, to: Point, t = 0.78): Point {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

export function drawFieldEdge(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  edge: FieldEdge,
  intro = 1,
): void {
  const style = edgeStroke(edge);
  const end = {
    x: to.x * intro + from.x * (1 - intro),
    y: to.y * intro + from.y * (1 - intro),
  };
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth;
  ctx.setLineDash(style.dash);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);

  if (edge.directed && edge.rel !== '≤' && intro > 0.5) {
    const head = headDotPosition(from, end);
    ctx.fillStyle = '#9a7344';
    ctx.shadowColor = '#9a7344';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}