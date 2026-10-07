// Each breathing pattern has its own bird: shown faintly behind the Home
// screen in the lower right corner while that pattern is selected, and
// listed on the About screen. Keyed by pattern id (see breathing-patterns.ts).
//
// size and shiftLeft place each bird's own silhouette on Home; the magpie is
// mirrored so that it faces into the screen like the others. On the dark
// background the mostly-black magpie and the dark emu need more opacity than
// the rest to read as equally faint.
export type PatternBird = {
  name: string;
  source: number;
  size: number;
  shiftLeft: number;
  mirrored?: boolean;
  darkOpacity: number;
};

export const PATTERN_BIRD_LIGHT_OPACITY = 0.5;

export const PATTERN_BIRDS: Record<string, PatternBird> = {
  box: {
    name: 'Australian magpie',
    source: require('../../assets/images/bg-magpie.png'),
    size: 380,
    shiftLeft: 10,
    mirrored: true,
    darkOpacity: 0.45,
  },
  fourSevenEight: {
    name: 'Laughing kookaburra',
    source: require('../../assets/images/bg-kookaburra.png'),
    size: 380,
    shiftLeft: 10,
    darkOpacity: 0.35,
  },
  simpleCalm: {
    name: 'Emu',
    source: require('../../assets/images/bg-emu.png'),
    size: 380,
    shiftLeft: -40,
    darkOpacity: 0.45,
  },
  cyclicSighing: {
    name: 'Variegated fairywren',
    source: require('../../assets/images/bg-variegated-wren.png'),
    size: 380,
    shiftLeft: 10,
    darkOpacity: 0.35,
  },
  ujjayi: {
    name: 'Gouldian finch',
    source: require('../../assets/images/bg-finch.png'),
    size: 320,
    shiftLeft: 10,
    darkOpacity: 0.35,
  },
  buteyko: {
    name: "Major Mitchell's cockatoo",
    source: require('../../assets/images/birds/major-mitchell.png'),
    size: 380,
    shiftLeft: 10,
    darkOpacity: 0.35,
  },
  tummo: {
    name: 'Sulphur-crested cockatoo',
    source: require('../../assets/images/birds/cockatoo-flight.png'),
    size: 380,
    shiftLeft: 10,
    darkOpacity: 0.35,
  },
};
