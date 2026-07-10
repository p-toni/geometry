import { INTRO_TEMPLATE } from './constants.js';

export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

export function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

export function clamp01(t) {
    return Math.max(0, Math.min(1, t));
  }

export function rgba(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
  }

export function makeBundledPath(x1, y1, x2, y2, P, cx, cy) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const cpx = mx + (cx - mx) * P.bundleStrength;
    const cpy = my + (cy - my) * P.bundleStrength;
    return { x1, y1, cpx, cpy, x2, y2 };
  }

export function pointOnPath(path, t) {
    const tt = clamp01(((t % 1) + 1) % 1);
    const mt = 1 - tt;
    return [
      mt * mt * path.x1 + 2 * mt * tt * path.cpx + tt * tt * path.x2,
      mt * mt * path.y1 + 2 * mt * tt * path.cpy + tt * tt * path.y2,
    ];
  }

export function partialQuadratic(path, t) {
    const p01x = path.x1 + (path.cpx - path.x1) * t;
    const p01y = path.y1 + (path.cpy - path.y1) * t;
    const p12x = path.cpx + (path.x2 - path.cpx) * t;
    const p12y = path.cpy + (path.y2 - path.cpy) * t;
    return {
      x1: path.x1,
      y1: path.y1,
      cpx: p01x,
      cpy: p01y,
      x2: p01x + (p12x - p01x) * t,
      y2: p01y + (p12y - p01y) * t,
    };
  }

export function splitLabel(text, maxLen = 18) {
    if (text === 'embodied threshold') return ['embodied', 'threshold'];
    if (text.length <= maxLen || !text.includes(' ')) return [text];
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxLen && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [text];
  }

export function makeTransition() {
    return {
      active: false,
      startTime: null,
      phase: 'in',
      fromId: null,
      duration: 450,
      fadeDuration: 620,
      prevActive: false,
      prevStartTime: null,
      prevEdgeSet: new Set(),
      prevNodeIds: new Set(),
      prevFadeDuration: 200,
      /**
       * True when hopping selection → selection. Keeps the field dimmed so
       * dimProgress does not restart at 0 (that flash is the node-hop blink).
       */
      retainDim: false,
    };
  }

export function makeView(key, canvas, P) {
    return {
      key,
      canvas,
      ctx: canvas.getContext('2d'),
      P,
      nodes: {},
      edges: [],
      particles: [],
      frame: 0,
      selectedId: null,
      hoverId: null,
      hoverProximity: 0,
      activeNodeIds: new Set(),
      activeEdgeSet: new Set(),
      activeBridgePeople: new Set(),
      nodeIntroOrder: [],
      intro: { ...INTRO_TEMPLATE },
      labelBoxes: [],
      selectionTransition: makeTransition(),
      hasShown: false,
    };
  }

