export interface FlowParams {
  influence: number;
  strength: number;
  frequency: number;
  speed: number;
}

export const FLOW_PRESETS: Record<string, FlowParams> = {
  calm: { influence: 0.06, strength: 0.24, frequency: 0.65, speed: 0.45 },
  drift: { influence: 0.1, strength: 0.6, frequency: 1.0, speed: 1.0 },
  swirl: { influence: 0.26, strength: 1.25, frequency: 1.35, speed: 1.25 },
  storm: { influence: 0.55, strength: 2.4, frequency: 1.8, speed: 1.6 },
};

export const PRESET_OPTIONS = [
  { label: 'calm', value: 'calm' },
  { label: 'drift', value: 'drift' },
  { label: 'swirl', value: 'swirl' },
  { label: 'storm', value: 'storm' },
];

export function resolvePreset(value: string | null | undefined): FlowParams {
  if (!value) return FLOW_PRESETS.drift;
  return FLOW_PRESETS[value] ?? FLOW_PRESETS.drift;
}
