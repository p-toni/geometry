import { generatedPool } from './generated';
import type { Pool } from './types';

export const pool: Pool = generatedPool;

export * from './types';
export {
  layout,
  lenses,
  positions,
  regions,
  FIELD_WIDTH,
  FIELD_HEIGHT,
} from './field';