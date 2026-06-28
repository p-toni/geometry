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
export const CANVAS_LABEL_FONT_STACK =
  '"Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display", "Neue Haas Display", "NHaasGroteskDSPro", "Neue Haas Grotesk Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
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
  particleStartOffset: 1400,
};

export const P_A = {
  innerRFrac: 0.18 * GRAPH_DEFAULT_SCALE,
  outerRFrac: 0.3,
  bundleStrength: 0.82,
  edgeAlpha: 0.12,
  edgeWidth: 0.4,
  maxParticles: 180,
  particleSpeed: 0.004,
  particleSize: 1.2,
  particleDecay: 0.003,
  personNodeR: 5.0,
  topicNodeR: 2.5,
  glowRadius: 22,
  fontPerson: 10,
  fontTopic: 8,
  labelOffset: 12,
  labelAlpha: 0.55,
  colorBg: '#050505',
  colorPerson: '#ffffff',
  colorEdge: '#aaaaaa',
  colorParticle: '#cccccc',
  colorLabelP: '#ffffff',
  colorLabelT: '#888888',
  vigStrength: 0.55,
  ringOpacity: 0.025,
};

export const P_B = {
  outerRFrac: 0.3,
  bundleStrength: 0.82,
  edgeAlpha: 0.12,
  edgeWidth: 0.35,
  maxParticles: 180,
  particleSpeed: 0.004,
  particleSize: 1.2,
  particleDecay: 0.003,
  topicNodeR: 2.5,
  glowRadius: 22,
  fontTopic: 8,
  labelOffset: 12,
  labelAlpha: 0.55,
  colorBg: '#050505',
  colorEdge: '#aaaaaa',
  colorParticle: '#cccccc',
  colorLabelT: '#888888',
  vigStrength: 0.55,
  ringOpacity: 0.025,
  sharedWeightScale: 1.0,
};