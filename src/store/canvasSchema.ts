import { BLOCK_TYPES } from '../constants';
import type { BlockType, Canvas, ColorToken, Control, Item } from '../types';

const blockTypes = new Set<string>(BLOCK_TYPES);
const colorTokens = new Set<number>([0, 1, 2, 3, 4, 5]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isColorToken(value: unknown): value is ColorToken {
  return isFiniteNumber(value) && colorTokens.has(value);
}

function isBlockType(value: unknown): value is BlockType {
  return isString(value) && blockTypes.has(value);
}

function parseControl(value: unknown, path: string): Control {
  if (!isRecord(value)) throw new Error(`${path} must be an object`);
  if (!isString(value.id)) throw new Error(`${path}.id must be a string`);
  if (value.kind === 'toggle') {
    if (typeof value.value !== 'boolean') throw new Error(`${path}.value must be boolean`);
    return { id: value.id, kind: 'toggle', value: value.value };
  }
  if (value.kind === 'slider') {
    if (!isFiniteNumber(value.value) || !isFiniteNumber(value.min) || !isFiniteNumber(value.max)) {
      throw new Error(`${path} slider values must be numbers`);
    }
    return { id: value.id, kind: 'slider', value: value.value, min: value.min, max: value.max };
  }
  if (value.kind === 'selector') {
    if (!isString(value.value) || !Array.isArray(value.options)) {
      throw new Error(`${path} selector values are invalid`);
    }
    const options = value.options.map((option, index) => {
      if (!isRecord(option) || !isString(option.label) || !isString(option.value)) {
        throw new Error(`${path}.options[${index}] is invalid`);
      }
      return { label: option.label, value: option.value };
    });
    return { id: value.id, kind: 'selector', value: value.value, options };
  }
  if (value.kind === 'action') {
    return { id: value.id, kind: 'action' };
  }
  throw new Error(`${path}.kind is invalid`);
}

function parseItem(value: unknown, path: string): Item {
  if (!isRecord(value)) throw new Error(`${path} must be an object`);
  if (!isString(value.id)) throw new Error(`${path}.id must be a string`);
  if (!isBlockType(value.type)) {
    throw new Error(`${path}.type is invalid`);
  }
  if (
    !isFiniteNumber(value.col) ||
    !isFiniteNumber(value.row) ||
    !isFiniteNumber(value.cols) ||
    !isFiniteNumber(value.rows)
  ) {
    throw new Error(`${path} grid values must be numbers`);
  }
  if (!isColorToken(value.color)) throw new Error(`${path}.color is invalid`);
  if (!isString(value.label)) throw new Error(`${path}.label must be a string`);
  if (!isString(value.content)) throw new Error(`${path}.content must be a string`);

  const controls =
    value.controls === undefined
      ? undefined
      : Array.isArray(value.controls)
        ? value.controls.map((control, index) => parseControl(control, `${path}.controls[${index}]`))
        : (() => {
            throw new Error(`${path}.controls must be an array`);
          })();

  return {
    id: value.id,
    type: value.type,
    col: value.col,
    row: value.row,
    cols: value.cols,
    rows: value.rows,
    color: value.color,
    label: value.label,
    content: value.content,
    linkIcon: isString(value.linkIcon) ? value.linkIcon : undefined,
    controls,
    refreshKey: isFiniteNumber(value.refreshKey) ? value.refreshKey : undefined,
  };
}

export function parseCanvas(value: unknown): Canvas {
  if (!isRecord(value)) throw new Error('canvas must be an object');
  if (value.version !== 1) throw new Error('canvas.version must be 1');
  if (!isString(value.slug)) throw new Error('canvas.slug must be a string');
  if (!isString(value.title)) throw new Error('canvas.title must be a string');
  if (value.background !== undefined && value.background !== 'paper' && value.background !== 'ink') {
    throw new Error('canvas.background is invalid');
  }
  if (!Array.isArray(value.items)) throw new Error('canvas.items must be an array');

  return {
    version: 1,
    slug: value.slug,
    title: value.title,
    background: value.background,
    items: value.items.map((item, index) => parseItem(item, `canvas.items[${index}]`)),
  };
}
