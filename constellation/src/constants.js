export const GRAPH_DEFAULT_SCALE = 0.85;
export const HOVER_THRESHOLD = 72;
export const HOVER_MAX_SCALE = 1.38;
export const HOVER_EDGE_BOOST = 1.6;
export const PERSON_HOVER_EDGE_ALPHA_BOOST = 0.03;
export const LABEL_HIT_PADDING = 12;
export const SELECTED_LABEL_FONT_BOOST = 1;
export const SELECTED_LABEL_WEIGHT_BOOST = 80;
export const PERSON_LABEL_WEIGHT = 400;
export const SELECTED_LABEL_OFFSET_BOOST = 4;
export const SELECTED_LABEL_NEIGHBOR_SHIFT = 7;
export const SELECTED_LABEL_NEIGHBOR_RANGE = 0.18;
export const SELECTED_TOPIC_LABEL_COLOR = '#d8d8d8';
export const CANVAS_LABEL_FONT_STACK = "'Inter', system-ui, sans-serif";
export const MOBILE_LAYOUT_BREAKPOINT = 680;
export const MOBILE_NODE_RADIUS_SCALE = 0.72;
export const MOBILE_GRAPH_RADIUS_SCALE = 1.15;
export const MOBILE_PERSON_LABEL_OFFSET_BOOST = 8;

export const INTRO_TEMPLATE = {
  startTime: null,
  duration: 2000,
  active: true,
  nodeDelay: 40,
  edgeGrowDuration: 900,
  edgeStartOffset: 400,
  particleStartOffset: 2000,
};

export const P_A = {
  innerRFrac: 0.18 * GRAPH_DEFAULT_SCALE,
  outerRFrac: 0.3,
  bundleStrength: 0.82,
  edgeAlpha: 0.15,
  edgeWidth: 0.46,
  maxParticles: 58,
  particleSpeed: 0.0028,
  particleSize: 1.0,
  particleDecay: 0.004,
  personNodeR: 5.2,
  lensNodeR: 7.4,
  topicNodeR: 2.7,
  glowRadius: 18,
  fontPerson: 12,
  fontTopic: 10,
  labelOffset: 13,
  labelAlpha: 0.62,
  colorBg: '#070707',
  colorBgTop: '#0d0d0b',
  colorBgBottom: '#030303',
  colorPerson: '#f4eee2',
  colorSection: '#dce8f5',
  colorLink: '#aab1b5',
  colorTopic: '#c9b88c',
  colorEdge: '#aeb7bd',
  colorStructural: '#6f8fb5',
  colorTension: '#c59a55',
  colorParticle: '#d7d0bf',
  colorLabelP: '#f4eee2',
  colorLabelT: '#a79d8a',
  vigStrength: 0.48,
  ringOpacity: 0.045,
  edgePulse: 0,
};

export const P_B = {
  outerRFrac: 0.3,
  bundleStrength: 0.82,
  edgeAlpha: 0.15,
  edgeWidth: 0.38,
  maxParticles: 44,
  particleSpeed: 0.0028,
  particleSize: 1.0,
  particleDecay: 0.004,
  topicNodeR: 2.8,
  glowRadius: 17,
  fontTopic: 10,
  labelOffset: 13,
  labelAlpha: 0.62,
  colorBg: '#070707',
  colorBgTop: '#0d0d0b',
  colorBgBottom: '#030303',
  colorEdge: '#aeb7bd',
  colorTopic: '#c9b88c',
  colorTension: '#c59a55',
  colorParticle: '#d7d0bf',
  colorLabelT: '#a79d8a',
  vigStrength: 0.48,
  ringOpacity: 0.045,
  sharedWeightScale: 1.0,
  edgePulse: 0,
};
