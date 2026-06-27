export type SectionRailTier = 'grammar' | 'beat';

export type SectionRailMeta = {
  display: string;
  letter: string;
  role: string;
  tagline: string;
  tier: SectionRailTier;
};

type RoleSpec = { letter: string; role: string; tagline: string };

const ROLES: Record<string, RoleSpec> = {
  frame: {
    letter: 'A',
    role: 'frame',
    tagline: 'what pressure makes the piece necessary',
  },
  claim: {
    letter: 'B',
    role: 'claim',
    tagline: 'the sentence the piece is trying to make durable',
  },
  operator: {
    letter: 'C',
    role: 'operator',
    tagline: 'the move, protocol, or test the reader can reuse',
  },
  seam: {
    letter: 'D',
    role: 'seam',
    tagline: 'what remains uncertain or provisional',
  },
  test: {
    letter: 'E',
    role: 'test',
    tagline: 'how to verify the argument holds',
  },
  consequence: {
    letter: 'F',
    role: 'consequence',
    tagline: 'what changes in design, work, memory, or AI use',
  },
};

const BEAT_TAGLINES: Record<string, string> = {
  block: 'equivalence-making after subtraction',
  face: 'a side that feels like the whole',
  rotation: 'invariance when the object is turned',
  void: 'functional absence where failure hides',
  crack: 'late failure along a line called cosmetic',
  workshop: 'rebuild from inside your own head',
  'how i work': 'operating loop and defaults',
  'operating principles': 'constraints that survive contact',
  'what i do': 'where judgment meets systems',
  background: 'context that shapes the loop',
  elsewhere: 'where the work continues',
  'current focus': 'what the loop is optimizing for now',
  'working thesis': 'the product shape underneath the model',
  'what belongs here': 'what earns a case study slot',
  standard: 'when documentation changes the loop',
};

function grammarMeta(display: string, key: keyof typeof ROLES, tier: SectionRailTier = 'grammar'): SectionRailMeta {
  const spec = ROLES[key];
  return { display, ...spec, tier };
}

/** Map essay h2 text to argument-grammar section rails (registry category headers). */
export function sectionRailMeta(heading: string, level: 2 | 3 = 2): SectionRailMeta | null {
  if (level === 3) return null;

  const stripped = heading.replace(/^(I{1,3}|IV|V|VI{0,3})\.\s+/i, '').trim();
  const lower = stripped.toLowerCase();

  if (lower === 'frame' || lower.startsWith('problem:')) return grammarMeta(stripped, 'frame');
  if (lower === 'claim') return grammarMeta(stripped, 'claim');
  if (lower.startsWith('operator')) return grammarMeta(heading.trim(), 'operator');
  if (lower === 'seam') return grammarMeta(stripped, 'seam');
  if (lower === 'test' || lower.startsWith('diagnostic') || lower.startsWith('curvature test')) {
    return grammarMeta(stripped, 'test');
  }
  if (
    lower === 'closing' ||
    lower === 'consequence' ||
    lower === 'design consequence' ||
    lower === 'what changed'
  ) {
    return grammarMeta(stripped, 'consequence');
  }

  if (lower === 'rule' || lower === 'protocol' || lower.startsWith('recovery protocol')) {
    return grammarMeta(stripped, 'operator');
  }
  if (
    lower === 'source' ||
    lower === 'flow control' ||
    lower === 'earned resonance' ||
    lower === 'final constraint' ||
    lower.startsWith('ai version') ||
    lower.startsWith('ai makes')
  ) {
    return grammarMeta(stripped, 'operator');
  }
  if (lower.startsWith('how this relates')) return grammarMeta(stripped, 'test');

  const beatTagline = BEAT_TAGLINES[lower];
  if (beatTagline) {
    return {
      display: stripped,
      letter: '·',
      role: stripped.toLowerCase(),
      tagline: beatTagline,
      tier: 'beat',
    };
  }

  return {
    display: stripped,
    letter: '·',
    role: stripped.toLowerCase(),
    tagline: '',
    tier: 'beat',
  };
}